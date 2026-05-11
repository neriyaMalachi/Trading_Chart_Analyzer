import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

import type { Tier } from '@tca/types';

import { DB_TOKEN, type Database } from '../../db/db.module';
import { users, type UserRow } from '../../db/schema';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe.Stripe | null;
  private readonly proPriceId: string | undefined;
  private readonly teamPriceId: string | undefined;
  private readonly webhookSecret: string | undefined;

  constructor(
    config: ConfigService,
    @Inject(DB_TOKEN) private readonly db: Database,
  ) {
    const apiKey = config.get<string>('STRIPE_SECRET_KEY');
    this.stripe = apiKey ? new Stripe(apiKey) : null;
    this.proPriceId = config.get<string>('STRIPE_PRO_PRICE_ID');
    this.teamPriceId = config.get<string>('STRIPE_TEAM_PRICE_ID');
    this.webhookSecret = config.get<string>('STRIPE_WEBHOOK_SECRET');
  }

  async createCheckoutSession(user: UserRow, tier: Exclude<Tier, 'free'>): Promise<string> {
    if (!this.stripe) throw new Error('Stripe not configured');
    const priceId = tier === 'pro' ? this.proPriceId : this.teamPriceId;
    if (!priceId) throw new Error(`Stripe price id missing for tier ${tier}`);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      success_url: 'tca://billing/success',
      cancel_url: 'tca://billing/cancel',
    });
    if (!session.url) throw new Error('Stripe session missing url');
    return session.url;
  }

  async handleWebhook(signature: string, rawBody: Buffer): Promise<void> {
    if (!this.stripe || !this.webhookSecret) return;
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;
        if (!userId) return;
        const tier: Tier = session.amount_total && session.amount_total >= 4900 ? 'team' : 'pro';
        await this.db.update(users).set({ tier, stripeCustomerId: session.customer as string }).where(eq(users.id, userId));
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer as string;
        await this.db.update(users).set({ tier: 'free' }).where(eq(users.stripeCustomerId, customerId));
        break;
      }
      default:
        this.logger.warn(`Unhandled Stripe event: ${event.type}`);
    }
  }
}
