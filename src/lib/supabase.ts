import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDB = any;

/** Browser client — uses anon key, respects RLS */
export const supabase = createClient<AnyDB>(supabaseUrl, supabaseAnonKey);

/** Server client — uses service role key, bypasses RLS */
export const supabaseAdmin = createClient<AnyDB>(
  supabaseUrl,
  supabaseServiceKey
);
