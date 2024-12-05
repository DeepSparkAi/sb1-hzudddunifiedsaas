import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { verifyIntegration } from '../utils/integration';
import toast from 'react-hot-toast';

interface Props {
  appId: string;
  externalUrl: string;
  onVerificationComplete: (success: boolean) => void;
}

export function VerifyIntegrationButton({ appId, externalUrl, onVerificationComplete }: Props) {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const success = await verifyIntegration(appId, externalUrl);
      onVerificationComplete(success);
      if (success) {
        toast.success('Integration verified successfully!');
      } else {
        toast.error('Integration verification failed. Please check the integration guide.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed');
      onVerificationComplete(false);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <button
      onClick={handleVerify}
      disabled={isVerifying}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
    >
      {isVerifying ? (
        <>
          <Loader className="animate-spin h-4 w-4 mr-2" />
          Verifying...
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Verify Integration
        </>
      )}
    </button>
  );
}