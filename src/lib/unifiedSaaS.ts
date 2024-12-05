import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

export const unifiedClient = createClient(env.unifiedSaaS.url, env.unifiedSaaS.anonKey);

export async function checkSubscription(): Promise<boolean> {
  try {
    const { data: { session } } = await unifiedClient.auth.getSession();
    
    if (!session) {
      return false;
    }

    const { data: subscription, error } = await unifiedClient
      .from('subscriptions')
      .select('status')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}