import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { ClaudeService } from './claude.service';
import { S3Service } from './s3.service';

@Module({
  imports: [UsersModule],
  controllers: [AnalysisController],
  providers: [AnalysisService, ClaudeService, S3Service],
  exports: [AnalysisService],
})
export class AnalysisModule {}
