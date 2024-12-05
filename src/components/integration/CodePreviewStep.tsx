import React from 'react';
import { Copy, Download, ExternalLink } from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard';
import toast from 'react-hot-toast';

interface Props {
  integrationCode: string;
  onBack: () => void;
  onDownload: () => void;
}

export function CodePreviewStep({ integrationCode, onBack, onDownload }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-900">
            Integration Code
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => copyToClipboard(integrationCode)}
              className="p-2 text-gray-400 hover:text-gray-500"
              title="Copy code"
            >
              <Copy className="h-5 w-5" />
            </button>
            <button
              onClick={onDownload}
              className="p-2 text-gray-400 hover:text-gray-500"
              title="Download code"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <pre className="text-sm overflow-x-auto">
            <code className="text-gray-800">{integrationCode}</code>
          </pre>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          Next Steps
        </h4>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-2">
          <li>Copy the code snippet above</li>
          <li>Add it to your app's HTML before the closing {'</body>'} tag</li>
          <li>Return to the App Settings page</li>
          <li>Click "Verify Integration" to complete the setup</li>
        </ol>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
        >
          Back
        </button>
        <a
          href="https://docs.example.com/integration"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          View Documentation
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </div>
    </div>
  );
}