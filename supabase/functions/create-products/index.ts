import { serve } from 'https://deno.land/std@0.138.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getStripe } from '../_shared/stripe.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { appId, products } = await req.json();
    
    if (!appId || !products?.length) {
      throw new Error('App ID and products are required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = getStripe('live'); // Always use live mode
    
    const { data: app, error: appError } = await supabase
      .from('apps')
      .select('name, description')
      .eq('id', appId)
      .single();

    if (appError || !app) {
      throw new Error('App not found');
    }

    const createdProducts = [];

    for (const product of products) {
      // Validate product data
      if (!product.name || !product.amount || !product.interval) {
        throw new Error(`Invalid product configuration: ${JSON.stringify(product)}`);
      }

      if (!['month', 'year'].includes(product.interval)) {
        throw new Error(`Invalid interval: ${product.interval}`);
      }

      if (typeof product.amount !== 'number' || product.amount < 0) {
        throw new Error(`Invalid amount: ${product.amount}`);
      }

      try {
        // Create Stripe product
        const stripeProduct = await stripe.products.create({
          name: `${app.name} - ${product.name}`,
          description: product.description || '',
          metadata: {
            app_id: appId,
            features: JSON.stringify(product.features || [])
          }
        });

        // Create Stripe price
        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: product.amount,
          currency: 'usd',
          recurring: {
            interval: product.interval
          },
          metadata: {
            app_id: appId
          }
        });

        // Save to database
        const { data: dbProduct, error: dbError } = await supabase
          .from('products')
          .insert({
            app_id: appId,
            name: product.name,
            description: product.description || '',
            amount: product.amount,
            currency: 'usd',
            interval: product.interval,
            features: product.features || [],
            stripe_product_id: stripeProduct.id,
            stripe_price_id: stripePrice.id,
            active: true
          })
          .select()
          .single();

        if (dbError) {
          throw new Error(`Database error: ${dbError.message}`);
        }

        createdProducts.push(dbProduct);
      } catch (error) {
        console.error(`Error creating product ${product.name}:`, error);
        throw error;
      }
    }

    return new Response(
      JSON.stringify({ products: createdProducts }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );
  } catch (error) {
    console.error('Create products error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    );
  }
});