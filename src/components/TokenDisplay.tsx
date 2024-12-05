import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { TokenField } from './TokenField';
import { TokenUsageGuide } from './TokenUsageGuide';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function TokenDisplay() {
  const { user, session } = useAuth();
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  if (!session) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-yellow-700">Please sign in to view authentication tokens.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <button
        onClick={() => setIsPanelVisible(!isPanelVisible)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-lg font-medium text-gray-900">Authentication Details</h2>
        {isPanelVisible ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      
      {isPanelVisible && (
        <div className="px-6 pb-6 space-y-4">
          <TokenField
            label="User ID"
            value={session.user.id}
            type="text"
          />

          <TokenField
            label="Access Token"
            value={session.access_token}
            type="password"
          />

          <TokenUsageGuide />
        </div>
      )}
    </div>
  );
}