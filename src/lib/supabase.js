import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate Supabase URL format before initializing
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

let supabaseInstance;

if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl) || supabaseUrl.includes('your-supabase-url')) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing or set to placeholder values. Using a mock fallback client.'
  );

  // Return a mock handler to prevent the app from throwing errors during initialization
  const makeMockProxy = () => {
    const handler = {
      get: (target, prop) => {
        // Return a proxy that chains indefinitely for any nested property, eventually returning a dummy promise
        if (prop === 'then' || prop === 'catch') {
          return undefined;
        }
        if (typeof target[prop] === 'function') {
          return target[prop];
        }
        const nextTarget = () => Promise.resolve({ data: null, error: new Error('Supabase client not configured') });
        return new Proxy(nextTarget, handler);
      }
    };
    return new Proxy(() => {}, handler);
  };

  supabaseInstance = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => makeMockProxy(),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    isMock: true,
  };
} else {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  supabaseInstance.isMock = false;
}

export const supabase = supabaseInstance;
