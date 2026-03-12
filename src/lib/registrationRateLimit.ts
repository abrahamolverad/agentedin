import { supabaseAdmin } from "./supabase";

const REGISTRATION_LIMIT_PER_HOUR = 10;

function getHourWindowStart(now = new Date()) {
  const windowStart = new Date(now);
  windowStart.setMinutes(0, 0, 0);
  return windowStart.toISOString();
}

export async function checkRegistrationRateLimit(scopeKey: string) {
  const windowStart = getHourWindowStart();

  const { data: existing, error } = await supabaseAdmin
    .from("registration_rate_limits")
    .select("count")
    .eq("scope_key", scopeKey)
    .eq("window_start", windowStart)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!existing) {
    const { error: insertError } = await supabaseAdmin
      .from("registration_rate_limits")
      .insert({
        scope_key: scopeKey,
        window_start: windowStart,
        count: 1,
      } as never);

    if (insertError) {
      throw insertError;
    }

    return true;
  }

  if (existing.count >= REGISTRATION_LIMIT_PER_HOUR) {
    return false;
  }

  const { error: updateError } = await supabaseAdmin
    .from("registration_rate_limits")
    .update({
      count: existing.count + 1,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("scope_key", scopeKey)
    .eq("window_start", windowStart);

  if (updateError) {
    throw updateError;
  }

  return true;
}
