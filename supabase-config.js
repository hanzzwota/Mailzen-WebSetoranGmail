/* Public browser configuration only. Never put a Supabase service-role key or Resend key here. */
export const SUPABASE_URL = window.MAILZEN_CONFIG?.supabaseUrl || "https://YOUR_PROJECT.supabase.co";
export const SUPABASE_ANON_KEY = window.MAILZEN_CONFIG?.supabaseAnonKey || "YOUR_SUPABASE_ANON_KEY";
export const isSupabaseConfigured = !SUPABASE_URL.includes("YOUR_PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR_");

let client;
export async function getSupabase() {
  if (!client) {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.57.4");
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}

export function configureMailzen({ url, anonKey } = {}) {
  if (url) window.MAILZEN_CONFIG = { ...(window.MAILZEN_CONFIG || {}), supabaseUrl: url };
  if (anonKey) window.MAILZEN_CONFIG = { ...(window.MAILZEN_CONFIG || {}), supabaseAnonKey: anonKey };
  window.location.reload();
}
