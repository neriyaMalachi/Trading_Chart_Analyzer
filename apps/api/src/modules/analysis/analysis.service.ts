import { Inject, Injectable } from '@nestjs/common';
import { LIMITS } from '@tca/constants';
import { desc, eq, sql } from 'drizzle-orm';

import type { Analysis, AnalysisHistoryResponse } from '@tca/types';
import type { UploadAnalysisRequestDto } from '@tca/validators';

import { DB_TOKEN, type Database } from '../../db/db.module';
import { analyses, type AnalysisRow, type UserRow } from '../../db/schema';
import { UsersService } from '../users/users.service';
import { ClaudeService } from './claude.service';
import { S3Service } from './s3.service';

@Injectable()
export class AnalysisService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: Database,
    private readonly s3: S3Service,
    private readonly claude: ClaudeService,
    private readonly users: UsersService,
  ) {}

  async upload(user: UserRow, input: UploadAnalysisRequestDto): Promise<Analysis> {
    const checkedUser = await this.users.assertCanAnalyse(user);

    const buffer = Buffer.from(input.imageBase64, 'base64');
    const s3Key = await this.s3.uploadChartImage(checkedUser.id, buffer, input.mimeType);

    const aiResult = await this.claude.analyseChart(input.imageBase64, input.mimeType);

    const [row] = await this.db
      .insert(analyses)
      .values({
        userId: checkedUser.id,
        imageS3Key: s3Key,
        trend: aiResult.trend,
        trendDescription: aiResult.trendDescription,
        keyLevels: aiResult.keyLevels,
        technicalSignals: aiResult.technicalSignals,
        pointsToWatch: aiResult.pointsToWatch,
        disclaimer: aiResult.disclaimer,
      })
      .returning();
    if (!row) throw new Error('Failed to persist analysis');

    await this.users.incrementAnalysisCount(checkedUser.id);
    await this.pruneOldAnalyses(checkedUser.id);

    return this.toAnalysis(row, await this.s3.getSignedUrl(row.imageS3Key));
  }

  async history(userId: string): Promise<AnalysisHistoryResponse> {
    const rows = await this.db
      .select()
      .from(analyses)
      .where(eq(analyses.userId, userId))
      .orderBy(desc(analyses.createdAt))
      .limit(LIMITS.MAX_HISTORY_PER_USER);

    const items = await Promise.all(
      rows.map(async (row) => this.toAnalysis(row, await this.s3.getSignedUrl(row.imageS3Key))),
    );
    return { items, total: items.length };
  }

  async byId(userId: string, id: string): Promise<Analysis | null> {
    const row = await this.db.query.analyses.findFirst({
      where: (t, { and: andOp }) => andOp(eq(t.id, id), eq(t.userId, userId)),
    });
    if (!row) return null;
    return this.toAnalysis(row, await this.s3.getSignedUrl(row.imageS3Key));
  }

  private async pruneOldAnalyses(userId: string): Promise<void> {
    await this.db.execute(sql`
      DELETE FROM ${analyses}
      WHERE id IN (
        SELECT id FROM ${analyses}
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        OFFSET ${LIMITS.MAX_HISTORY_PER_USER}
      )
    `);
  }

  private toAnalysis(row: AnalysisRow, imageUrl: string): Analysis {
    return {
      id: row.id,
      userId: row.userId,
      imageUrl,
      trend: row.trend,
      trendDescription: row.trendDescription,
      keyLevels: row.keyLevels,
      technicalSignals: row.technicalSignals,
      pointsToWatch: row.pointsToWatch,
      disclaimer: row.disclaimer,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
