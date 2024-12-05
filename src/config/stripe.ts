import { z } from 'zod';

// Schema for Stripe mode validation
const StripeModeSchema = z.enum(['test', 'live']);

// Always use live mode
const mode = 'live';

// Get the appropriate key based on mode
const getStripePublicKey = () => {
  const key = import.meta.env.VITE_STRIPE_LIVE_PUBLIC_KEY;
  if (!key) throw new Error('Missing VITE_STRIPE_LIVE_PUBLIC_KEY');
  return key;
};

export const stripeConfig = {
  mode,
  publicKey: getStripePublicKey(),
  isLive: true,
  isTest: false
} as const;