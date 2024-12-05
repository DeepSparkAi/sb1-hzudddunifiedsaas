import { supabase } from '../lib/supabase';
import { DEFAULT_APP_COLOR } from './constants';
import { stripeConfig } from '../config/stripe';
import type { AppTemplate } from '../types/template';

export async function generateUniqueSlug(baseSlug: string): Promise<string> {
  try {
    let uniqueSlug = baseSlug;
    let counter = 1;
    let isUnique = false;

    while (!isUnique) {
      const { data } = await supabase
        .from('apps')
        .select('id')
        .eq('slug', uniqueSlug)
        .maybeSingle();

      if (!data) {
        isUnique = true;
      } else {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    return uniqueSlug;
  } catch (error) {
    console.error('Error generating unique slug:', error);
    throw new Error('Failed to generate unique slug');
  }
}

export async function createApp(params: {
  name: string;
  slug: string;
  template: AppTemplate;
  config: Record<string, string>;
  userId: string;
}) {
  const { name, slug, template, config, userId } = params;

  // Ensure primary_color has a default value
  const appConfig = {
    ...config,
    primary_color: config.primary_color || DEFAULT_APP_COLOR,
  };

  const { data: app, error: appError } = await supabase
    .from('apps')
    .insert({
      name,
      slug,
      template_id: template.id,
      owner_id: userId,
      config: appConfig,
      active: true,
      primary_color: appConfig.primary_color,
      description: template.description || '',
    })
    .select()
    .single();

  if (appError) {
    console.error('Error creating app:', appError);
    throw new Error(appError.message);
  }

  if (!app) {
    throw new Error('Failed to create app');
  }

  return app;
}

export async function createProducts(params: {
  appId: string;
  products: any[];
  accessToken: string;
}) {
  const { appId, products, accessToken } = params;

  if (!appId || !products?.length) {
    throw new Error('App ID and products are required');
  }

  // Format and validate products before sending
  const productsToCreate = products.map(product => {
    if (!product.name || !product.amount || !product.interval) {
      throw new Error(`Invalid product configuration: ${JSON.stringify(product)}`);
    }

    return {
      name: product.name,
      description: product.description || '',
      amount: parseInt(product.amount, 10), // Ensure amount is a number
      interval: product.interval,
      features: product.features || [],
      currency: 'usd'
    };
  });

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      appId,
      products: productsToCreate
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Create products error:', errorData);
    throw new Error(errorData.error || 'Failed to create products');
  }

  const productsData = await response.json();

  if (!productsData?.products || productsData.products.length === 0) {
    throw new Error('No products were created');
  }

  return productsData.products;
}