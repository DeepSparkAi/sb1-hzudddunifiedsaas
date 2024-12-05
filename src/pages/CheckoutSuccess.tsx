import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const returnUrl = searchParams.get('return_url');
    const sessionId = searchParams.get('session_id');

    if (sessionId) {
      toast.success('Payment successful! Redirecting...');
      
      // Short delay to show the success message
      const timer = setTimeout(() => {
        navigate(returnUrl || '/', { replace: true });
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Thank you for your subscription. Redirecting you back...
        </p>
        <LoadingSpinner />
      </div>
    </div>
  );
}