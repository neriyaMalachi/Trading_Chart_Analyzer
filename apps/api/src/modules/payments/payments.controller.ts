import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { UserRow } from '../../db/schema';
import { PaymentsService } from './payments.service';

const CheckoutSchema = z.object({ tier: z.enum(['pro', 'team']) });
type CheckoutDto = z.infer<typeof CheckoutSchema>;

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(
    @CurrentUser() user: UserRow,
    @Body() body: CheckoutDto,
  ): Promise<{ url: string }> {
    const parsed = CheckoutSchema.parse(body);
    return { url: await this.payments.createCheckoutSession(user, parsed.tier) };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request & { rawBody?: Buffer },
  ): Promise<{ received: boolean }> {
    if (req.rawBody) await this.payments.handleWebhook(signature, req.rawBody);
    return { received: true };
  }
}
