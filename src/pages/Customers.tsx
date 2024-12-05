import React from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { CustomerTable } from '../components/customers/CustomerTable';
import { EmptyState } from '../components/customers/EmptyState';

export function Customers() {
  const { customers, loading, error } = useCustomers();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!customers?.length) return <EmptyState />;

  return (
    <ErrorBoundary>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Customer List</h3>
          <div className="mt-5">
            <CustomerTable customers={customers} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}