import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAppBySlug } from '../utils/queries';
import type { App } from '../types/app';

export function useApp() {
  const { slug } = useParams<{ slug: string }>();
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadApp() {
      try {
        if (!slug) {
          throw new Error('App slug is required');
        }

        const data = await fetchAppBySlug(slug);
        setApp(data);
        setError(null);
      } catch (err) {
        console.error('Error loading app:', err);
        setError(err instanceof Error ? err.message : 'Failed to load app');
        setApp(null);
      } finally {
        setLoading(false);
      }
    }

    loadApp();
  }, [slug]);

  return { app, loading, error };
}