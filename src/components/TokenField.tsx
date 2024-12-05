import React, { useState } from 'react';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

interface TokenFieldProps {
  label: string;
  value: string;
  type: 'text' | 'password';
}

export function TokenField({ label, value, type }: TokenFieldProps) {
  const [isVisible, setIsVisible] = useState(type === 'text');

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleVisibility}
            className="text-sm text-indigo-600 hover:text-indigo-500 p-1"
            title={isVisible ? 'Hide' : 'Show'}
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => copyToClipboard(value)}
            className="text-indigo-600 hover:text-indigo-500 p-1"
            title={`Copy ${label}`}
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="relative">
        <p className="text-sm text-gray-900 break-all bg-gray-50 p-2 rounded font-mono">
          {isVisible ? value : '•'.repeat(Math.min(value.length, 30))}
        </p>
      </div>
    </div>
  );
}