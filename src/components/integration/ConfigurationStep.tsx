import React from 'react';
import type { IntegrationConfig } from '../../types/integration';

interface Props {
  config: IntegrationConfig;
  onConfigChange: (field: keyof IntegrationConfig, value: any) => void;
  onFeatureToggle: (feature: string) => void;
  onNext: () => void;
  onClose: () => void;
}

export function ConfigurationStep({
  config,
  onConfigChange,
  onFeatureToggle,
  onNext,
  onClose
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          API Mode
        </label>
        <select
          value={config.mode}
          onChange={(e) => onConfigChange('mode', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="test">Test Mode</option>
          <option value="live">Live Mode</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Features
        </label>
        <div className="space-y-2">
          {['subscription', 'authentication', 'webhooks'].map((feature) => (
            <label key={feature} className="flex items-center">
              <input
                type="checkbox"
                checked={config.features.includes(feature)}
                onChange={() => onFeatureToggle(feature)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-600 capitalize">
                {feature}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Return URL
        </label>
        <input
          type="url"
          value={config.returnUrl}
          onChange={(e) => onConfigChange('returnUrl', e.target.value)}
          placeholder="https://your-app.com/subscription/success"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Users will be redirected here after subscribing
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={onNext}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Generate Code
        </button>
      </div>
    </div>
  );
}