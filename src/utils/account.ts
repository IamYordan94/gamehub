// account.ts — lazy Supabase wrapper for Yodoku+ accounts.
// Dormant until VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY exist (Vercel env).
// Never throws; returns 'accounts-not-configured' instead.

import { accountConfigured, SUPABASE_URL, SUPABASE_ANON_KEY } from './monetization';

type SupaSession = { user?: { email?: string | null } } | null;

type SupaClient = {
  auth: {
    signInWithOtp: (args: {
      email: string;
      options?: { emailRedirectTo?: string };
    }) => Promise<{ error: { message: string } | null }>;
    signOut: () => Promise<{ error: unknown }>;
    getSession: () => Promise<{ data: { session: SupaSession } }>;
  };
};

let clientPromise: Promise<SupaClient | null> | null = null;

async function getClient(): Promise<SupaClient | null> {
  if (!accountConfigured()) return null;
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_ANON_KEY) as unknown as SupaClient)
      .catch(() => null);
  }
  return clientPromise;
}

/** Send a magic sign-in link to the email. */
export async function requestMagicLink(email: string): Promise<{ ok: boolean; error?: string }> {
  const client = await getClient();
  if (!client) return { ok: false, error: 'accounts-not-configured' };
  try {
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/plus' },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

export async function signOut(): Promise<void> {
  const client = await getClient();
  if (client) await client.auth.signOut();
}

export async function getSessionEmail(): Promise<string | null> {
  const client = await getClient();
  if (!client) return null;
  try {
    const { data } = await client.auth.getSession();
    return data.session?.user?.email ?? null;
  } catch {
    return null;
  }
}
