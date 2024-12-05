import { supabase } from '../../lib/supabase';
import type { App } from '../../types/app';
import { DatabaseError } from '../errors';

export async function fetchAppBySlug(slug: string): Promise<App> {
  try {
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
      throw new DatabaseError('Failed to fetch app', error);
    }

    if (!data) {
      throw new Error('App not found');
    }

    return data as App;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to fetch app', error);
  }
}