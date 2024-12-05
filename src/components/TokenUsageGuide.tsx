import React from 'react';

export function TokenUsageGuide() {
  return (
    <div className="pt-4 border-t">
      <p className="text-sm text-gray-500">
        For API testing, use the Access Token in the Authorization header:
      </p>
      <code className="mt-2 block text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono">
        Authorization: Bearer [Access Token]
      </code>
    </div>
  );
}