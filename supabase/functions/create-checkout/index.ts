import { serve } from 'https://deno.land/std@0.138.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getStripe } from '../_shared/stripe.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { price_id, user_id, success_url, cancel_url } = await req.json();
    
    console.log('Processing checkout request:', { price_id, user_id });
    
    if (!price_id?.startsWith('price_')) {
      throw new Error('Invalid price ID format');
    }

    if (!user_id) {
      throw new Error('User ID is required');
    }

    const stripe = getStripe('live');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the price exists and is active in Stripe
    let price;
    try {
      price = await stripe.prices.retrieve(price_id);
      if (!price.active) {
        throw new Error('Price is not active');
      }
      console.log('Price verified:', price.id);
    } catch (error) {
      console.error('Price verification failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Invalid price ID');
    }

    // Get or create customer
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('stripe_customer_id, email')
      .eq('user_id', user_id)
      .single();

    if (customerError && customerError.code !== 'PGRST116') {
      console.error('Customer fetch error:', customerError);
      throw customerError;
    }

    let stripeCustomerId = customerData?.stripe_customer_id;

    if (!stripeCustomerId) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
      
      if (userError || !userData.user?.email) {
        console.error('User fetch error:', userError);
        throw new Error('Failed to fetch user data');
      }

      console.log('Creating new Stripe customer for user:', user_id);

      const customer = await stripe.customers.create({
        email: userData.user.email,
        metadata: {
          supabase_user_id: user_id
        },
      });

      stripeCustomerId = customer.id;

      const { error: insertError } = await supabase
        .from('customers')
        .insert({
          user_id: user_id,
          email: userData.user.email,
          stripe_customer_id: customer.id,
          subscription_status: 'inactive'
        });

      if (insertError) {
        console.error('Customer insert error:', insertError);
        throw new Error('Failed to create customer record');
      }
    }

    console.log('Creating checkout session for customer:', stripeCustomerId);

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [{ price: price_id, quantity: 1 }],
      mode: 'subscription',
      success_url,
      cancel_url,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      payment_method_types: ['card'],
      client_reference_id: user_id,
      subscription_data: {
        metadata: {
          user_id,
          price_id
        }
      }
    });

    if (!session.id?.startsWith('cs_live_')) {
      throw new Error('Invalid session ID created');
    }

    console.log('Checkout session created successfully:', session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : 'Unknown error'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    );
  }
});