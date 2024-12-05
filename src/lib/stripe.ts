import { loadStripe } from '@stripe/stripe-js';
import { stripeConfig } from '../config/stripe';

let stripePromise: Promise<any> | null = null;

export const getStripe = async () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripeConfig.publicKey);
  }
  return stripePromise;
};