import { serve } from 'https://deno.land/std@0.138.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getStripe } from '../_shared/stripe.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    const body = await req.text();
    const mode = req.headers.get('stripe-mode') || 'test';
    const stripe = getStripe(mode as 'test' | 'live');
    
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Get customer from Stripe
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata.supabase_user_id;
        const mode = customer.metadata.mode || 'test';

        // Get price details
        const priceId = subscription.items.data[0].price.id;
        const { data: productData } = await supabase
          .from('products')
          .select('id, name, app_id')
          .eq('stripe_price_id', priceId)
          .single();

        if (!productData) {
          throw new Error('Product not found for price: ' + priceId);
        }

        // Update subscription in database
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            app_id: productData.app_id,
            product_id: productData.id,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at 
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
            metadata: {
              mode,
              stripe_metadata: subscription.metadata
            }
          });

        // Update customer subscription status
        await supabase
          .from('customers')
          .update({ 
            subscription_status: subscription.status,
            metadata: {
              mode,
              last_updated: new Date().toISOString(),
              stripe_metadata: customer.metadata
            }
          })
          .eq('stripe_customer_id', customerId)
          .eq('mode', mode);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Get customer to determine mode
        const customer = await stripe.customers.retrieve(customerId);
        const mode = customer.metadata.mode || 'test';

        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            metadata: {
              mode,
              canceled_reason: subscription.cancellation_details?.reason || 'unknown',
              stripe_metadata: subscription.metadata
            }
          })
          .eq('stripe_subscription_id', subscription.id);

        // Update customer status if no active subscriptions remain
        const { data: activeSubscriptions } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('status', 'active')
          .eq('user_id', customer.metadata.supabase_user_id)
          .eq('mode', mode)
          .limit(1);

        if (!activeSubscriptions?.length) {
          await supabase
            .from('customers')
            .update({ 
              subscription_status: 'inactive',
              metadata: {
                mode,
                last_updated: new Date().toISOString(),
                stripe_metadata: customer.metadata
              }
            })
            .eq('stripe_customer_id', customerId)
            .eq('mode', mode);
        }

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});