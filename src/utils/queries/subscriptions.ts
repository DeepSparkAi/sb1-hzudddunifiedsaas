import { supabase } from '../../lib/supabase';
import type { Subscription } from '../../types/subscription';
import { DatabaseError, AuthenticationError } from '../errors';

export async function fetchSubscriptions(): Promise<Subscription[]> {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session) {
      throw new AuthenticationError('Authentication required');
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        products (
          name,
          amount,
          interval
        ),
        apps (
          name,
          slug
        )
      `)
      .eq('user_id', session.session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new DatabaseError('Failed to fetch subscriptions', error);
    }

    return (data || []).map(subscription => ({
      ...subscription,
      plan: subscription.products?.name || 'Unknown Plan',
      amount: subscription.products?.amount || 0
    }));
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to fetch subscriptions', error);
  }
}