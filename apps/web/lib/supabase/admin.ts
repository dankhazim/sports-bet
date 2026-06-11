import { createClient } from '@supabase/supabase-js';

/**
 * Service role kliens — RLS-t megkerüli, KIZÁRÓLAG szerveroldalon
 * (cron route-okban) használható.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
