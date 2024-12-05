import { supabase } from '../../lib/supabase';
import type { Customer } from '../../types/customer';
import { DatabaseError, AuthenticationError } from '../errors';

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session) {
      throw new AuthenticationError('Authentication required');
    }

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', session.session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new DatabaseError('Failed to fetch customers', error);
    }

    return data || [];
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to fetch customers', error);
  }
}