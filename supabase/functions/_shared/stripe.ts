import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno';

export function getStripe(mode: 'test' | 'live') {
  const secretKey = Deno.env.get('STRIPE_LIVE_SECRET_KEY');

  if (!secretKey?.startsWith('sk_live_')) {
    throw new Error('Invalid or missing STRIPE_LIVE_SECRET_KEY');
  }

  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
    maxNetworkRetries: 3,
    timeout: 30000, // 30 second timeout
  });
}