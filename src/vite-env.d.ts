/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_STRIPE_MODE: 'test' | 'live'
  readonly VITE_STRIPE_LIVE_PUBLIC_KEY: string
  readonly VITE_STRIPE_TEST_PUBLIC_KEY: string
  readonly VITE_UNIFIED_SAAS_URL: string
  readonly VITE_UNIFIED_SAAS_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}