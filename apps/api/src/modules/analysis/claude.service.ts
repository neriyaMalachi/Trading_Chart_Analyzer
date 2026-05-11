import Anthropic from '@anthropic-ai/sdk';
import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DISCLAIMER_TEXT, LIMITS, SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from '@tca/constants';
import { AnalysisResponseSchema, type AnalysisResponseDto } from '@tca/validators';

import type { SupportedMimeType } from '@tca/types';

@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(config: ConfigService) {
    this.client = new Anthropic({ apiKey: config.getOrThrow<string>('ANTHROPIC_API_KEY') });
    this.model = config.getOrThrow<string>('ANTHROPIC_MODEL');
  }

  async analyseChart(imageBase64: string, mimeType: SupportedMimeType): Promise<AnalysisResponseDto> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: LIMITS.CLAUDE_MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: imageBase64 },
            },
            { type: 'text', text: USER_PROMPT_TEMPLATE },
          ],
        },
      ],
    });

    const block = response.content.find((c) => c.type === 'text');
    if (!block || block.type !== 'text') {
      throw new BadGatewayException('Claude returned no text content');
    }

    const raw = this.extractJson(block.text);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      this.logger.error(`Claude JSON parse error: ${(err as Error).message}\nRaw: ${raw}`);
      throw new BadGatewayException('Claude returned malformed JSON');
    }

    const result = AnalysisResponseSchema.safeParse(parsed);
    if (!result.success) {
      this.logger.error(`Claude schema validation failed: ${JSON.stringify(result.error.issues)}`);
      throw new BadGatewayException('Claude response failed schema validation');
    }
    return { ...result.data, disclaimer: DISCLAIMER_TEXT };
  }

  private extractJson(text: string): string {
    const trimmed = text.trim();
    if (trimmed.startsWith('{')) return trimmed;
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new BadGatewayException('No JSON object found in Claude response');
    return match[0];
  }
}
