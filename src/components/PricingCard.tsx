import React from 'react';
import { Check } from 'lucide-react';
import { getStripe } from '../lib/stripe';
import toast from 'react-hot-toast';
import type { Product } from '../types/product';
import { formatPrice } from '../utils/format';
import { useAuth } from '../hooks/useAuth';
import { createCheckoutSession } from '../utils/stripe';

interface Props {
  product: Product;
}

export function PricingCard({ product }: Props) {
  const { user, session } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubscribe = async () => {
    try {
      if (!user || !session) {
        toast.error('Please sign in to subscribe');
        return;
      }

      if (!product.stripe_price_id) {
        toast.error('Invalid product configuration');
        return;
      }

      setIsLoading(true);
      const toastId = toast.loading('Initializing checkout...');

      // Create a unique success URL with a state parameter
      const successUrl = new URL(`${window.location.origin}/checkout/success`);
      successUrl.searchParams.append('session_id', '{CHECKOUT_SESSION_ID}');
      successUrl.searchParams.append('return_url', window.location.pathname);

      const { sessionId, error } = await createCheckoutSession({
        priceId: product.stripe_price_id,
        userId: user.id,
        successUrl: successUrl.toString(),
        cancelUrl: window.location.href,
        accessToken: session.access_token
      });

      if (error || !sessionId) {
        throw new Error(error || 'Failed to create checkout session');
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error: redirectError } = await stripe.redirectToCheckout({ sessionId });

      if (redirectError) {
        throw redirectError;
      }

      toast.dismiss(toastId);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initiate checkout');
      setIsLoading(false);
      toast.dismiss();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-8">
        <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-5xl font-extrabold text-gray-900">
            ${formatPrice(product.amount)}
          </span>
          <span className="ml-1 text-xl font-semibold text-gray-500">
            /{product.interval}
          </span>
        </div>
        <p className="mt-4 text-gray-500">{product.description}</p>
        <ul className="mt-6 space-y-4">
          {product.features?.map((feature) => (
            <li key={feature} className="flex">
              <Check className="flex-shrink-0 w-6 h-6 text-green-500" />
              <span className="ml-3 text-gray-500">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-6 py-8 bg-gray-50">
        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Subscribe Now'}
        </button>
      </div>
    </div>
  );
}