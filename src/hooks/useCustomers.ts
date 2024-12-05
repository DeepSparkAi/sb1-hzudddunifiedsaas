import { useState, useEffect } from 'react';
import { fetchCustomers } from '../utils/queries';
import type { Customer } from '../types/customer';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await fetchCustomers();
        setCustomers(data);
        setError(null);
      } catch (err) {
        console.error('Error loading customers:', err);
        setError(err instanceof Error ? err.message : 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  return { customers, loading, error };
}