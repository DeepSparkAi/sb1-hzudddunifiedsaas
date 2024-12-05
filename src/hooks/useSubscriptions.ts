import { useState, useEffect } from 'react';
import { fetchSubscriptions } from '../utils/queries';
import type { Subscription } from '../types/subscription';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubscriptions() {
      try {
        const data = await fetchSubscriptions();
        setSubscriptions(data);
        setError(null);
      } catch (err) {
        console.error('Error loading subscriptions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    }

    loadSubscriptions();
  }, []);

  return { subscriptions, loading, error };
}