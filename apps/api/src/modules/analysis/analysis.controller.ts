import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  UploadAnalysisRequestSchema,
  type UploadAnalysisRequestDto,
} from '@tca/validators';
import { ZodValidationPipe } from 'nestjs-zod';

import type { Analysis, AnalysisHistoryResponse } from '@tca/types';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { UserRow } from '../../db/schema';
import { AnalysisService } from './analysis.service';

@Controller('analysis')
@UseGuards(JwtAuthGuard)
export class AnalysisController {
  constructor(private readonly analysis: AnalysisService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  async upload(
    @CurrentUser() user: UserRow,
    @Body(new ZodValidationPipe(UploadAnalysisRequestSchema)) body: UploadAnalysisRequestDto,
  ): Promise<{ analysis: Analysis }> {
    return { analysis: await this.analysis.upload(user, body) };
  }

  @Get('history')
  async history(@CurrentUser() user: UserRow): Promise<AnalysisHistoryResponse> {
    return this.analysis.history(user.id);
  }

  @Get(':id')
  async byId(
    @CurrentUser() user: UserRow,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ analysis: Analysis }> {
    const found = await this.analysis.byId(user.id, id);
    if (!found) throw new NotFoundException('Analysis not found');
    return { analysis: found };
  }
}
