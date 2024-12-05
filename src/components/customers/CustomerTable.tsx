import React from 'react';
import { User, Mail, Calendar } from 'lucide-react';
import type { CustomerTableProps } from '../../types/customer';

export function CustomerTable({ customers }: CustomerTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {customers.map((customer) => (
            <CustomerRow key={customer.id} customer={customer} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomerRow({ customer }: { customer: CustomerTableProps['customers'][0] }) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <User className="h-5 w-5 text-gray-400" />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {customer.id}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-gray-400" />
          <span className="ml-2 text-sm text-gray-900">{customer.email}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">
            {new Date(customer.created_at).toLocaleDateString()}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <CustomerStatus status={customer.subscription_status} />
      </td>
    </tr>
  );
}

function CustomerStatus({ status }: { status: string }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles()}`}>
      {status}
    </span>
  );
}