export interface Customer {
  id: string;
  user_id: string;
  email: string;
  stripe_customer_id: string | null;
  subscription_status: 'active' | 'inactive' | 'past_due' | 'canceled';
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

export interface CustomerTableProps {
  customers: Customer[];
}