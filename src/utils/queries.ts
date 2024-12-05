import { supabase } from '../lib/supabase';
import type { App } from '../types/app';
import type { Customer } from '../types/customer';
import type { Subscription } from '../types/subscription';

export async function fetchAppBySlug(slug: string): Promise<App> {
  const { data, error } = await supabase
    .from('apps')
    .select(`
      id,
      name,
      slug,
      description,
      logo_url,
      primary_color,
      owner_id,
      created_at,
      active,
      metadata
    `)
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('App not found');
  }

  return data as App;
}

export async function fetchCustomers(): Promise<Customer[]> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session) {
    throw new Error('Authentication required');
  }

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', session.session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session) {
    throw new Error('Authentication required');
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
    throw error;
  }

  return (data || []).map(subscription => ({
    ...subscription,
    plan: subscription.products?.name || 'Unknown Plan',
    amount: subscription.products?.amount || 0
  }));
}