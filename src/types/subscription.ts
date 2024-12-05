export interface Subscription {
  id: string;
  user_id: string;
  app_id: string;
  customer_id: string;
  product_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
  products?: {
    name: string;
    amount: number;
    interval: string;
  };
  apps?: {
    name: string;
    slug: string;
  };
  // Computed fields
  plan: string;
  amount: number;
}