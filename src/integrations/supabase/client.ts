// Supabase client configuration
// Note: Environment variable validation added for deployment reliability
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Validate environment variables at runtime
const isConfigured = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY;

if (!isConfigured) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your Vercel project settings.');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Create the Supabase client only when properly configured
// Using placeholder values to prevent app crash during build, but operations will fail gracefully
export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_PUBLISHABLE_KEY || 'placeholder-key',
  {
    auth: {
      storage: isBrowser ? localStorage : undefined,
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
    }
  }
);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => isConfigured;