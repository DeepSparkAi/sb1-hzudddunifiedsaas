// Environment variable validation and configuration
const requiredEnvVars = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_UNIFIED_SAAS_URL: import.meta.env.VITE_UNIFIED_SAAS_URL,
  VITE_UNIFIED_SAAS_ANON_KEY: import.meta.env.VITE_UNIFIED_SAAS_ANON_KEY,
} as const;

function validateUrl(url: string | undefined, name: string): string {
  if (!url) {
    throw new Error(`Missing ${name}`);
  }
  
  const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
  
  try {
    new URL(urlWithProtocol);
    return urlWithProtocol;
  } catch {
    throw new Error(`Invalid URL for ${name}: ${url}`);
  }
}

function validateKey(key: string | undefined, name: string): string {
  if (!key) {
    throw new Error(`Missing ${name}`);
  }
  return key;
}

export const env = {
  supabase: {
    url: validateUrl(requiredEnvVars.VITE_SUPABASE_URL, 'VITE_SUPABASE_URL'),
    anonKey: validateKey(requiredEnvVars.VITE_SUPABASE_ANON_KEY, 'VITE_SUPABASE_ANON_KEY'),
  },
  unifiedSaaS: {
    url: validateUrl(requiredEnvVars.VITE_UNIFIED_SAAS_URL, 'VITE_UNIFIED_SAAS_URL'),
    anonKey: validateKey(requiredEnvVars.VITE_UNIFIED_SAAS_ANON_KEY, 'VITE_UNIFIED_SAAS_ANON_KEY'),
  },
} as const;