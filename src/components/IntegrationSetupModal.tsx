import React, { useState } from 'react';
import { X } from 'lucide-react';
import { generateIntegrationCode } from '../utils/codeGeneration';
import type { IntegrationConfig } from '../types/integration';
import { ConfigurationStep } from './integration/ConfigurationStep';
import { CodePreviewStep } from './integration/CodePreviewStep';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  appId: string;
}

export function IntegrationSetupModal({ isOpen, onClose, appName, appId }: Props) {
  const [config, setConfig] = useState<IntegrationConfig>({
    mode: 'test',
    features: ['subscription'],
    returnUrl: '',
  });

  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleConfigChange = (field: keyof IntegrationConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const integrationCode = generateIntegrationCode({
    appId,
    appName,
    ...config
  });

  const downloadSnippet = () => {
    const blob = new Blob([integrationCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unified-saas-integration.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Integration code downloaded');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          App Integration Setup
        </h2>

        {step === 1 ? (
          <ConfigurationStep
            config={config}
            onConfigChange={handleConfigChange}
            onFeatureToggle={handleFeatureToggle}
            onNext={() => setStep(2)}
            onClose={onClose}
          />
        ) : (
          <CodePreviewStep
            integrationCode={integrationCode}
            onBack={() => setStep(1)}
            onDownload={downloadSnippet}
          />
        )}
      </div>
    </div>
  );
}