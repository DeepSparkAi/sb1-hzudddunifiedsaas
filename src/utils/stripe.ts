import { loadStripe } from '@stripe/stripe-js';
import { stripeConfig } from '../config/stripe';

let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripeConfig.publicKey);
  }
  return stripePromise;
};

interface CheckoutSessionParams {
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  accessToken: string;
}

export async function createCheckoutSession({
  priceId,
  userId,
  successUrl,
  cancelUrl,
  accessToken
}: CheckoutSessionParams) {
  try {
    if (!priceId?.startsWith('price_')) {
      throw new Error('Invalid price ID format');
    }

    console.log('Creating checkout session with:', { priceId });
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        price_id: priceId,
        user_id: userId,
        success_url: successUrl,
        cancel_url: cancelUrl
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Checkout error response:', data);
      throw new Error(data.error || `Failed to create checkout session: ${response.status}`);
    }

    console.log('Checkout session response:', data);

    if (!data.sessionId?.startsWith('cs_live_')) {
      throw new Error('Invalid session ID returned from server');
    }

    return { sessionId: data.sessionId };
  } catch (error) {
    console.error('Create checkout session error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to initialize checkout' };
  }
}