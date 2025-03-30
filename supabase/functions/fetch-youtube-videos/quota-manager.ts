

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function checkQuota() {
  try {
    const { data, error } = await supabase
      .from("api_quota_tracking")
      .select("quota_remaining, quota_reset_at")
      .eq("api_name", "youtube")
      .single();

    if (error) {
      console.error("Error checking quota:", error);
      // Default to allowing some quota if we can't check
      return { quota_remaining: 1000, quota_reset_at: new Date().toISOString() };
    }

    // If we're past reset time, reset the quota
    if (new Date() > new Date(data.quota_reset_at)) {
      const { data: resetData } = await supabase
        .from("api_quota_tracking")
        .update({
          quota_remaining: 10000,
          quota_reset_at: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
        })
        .eq("api_name", "youtube")
        .select("quota_remaining, quota_reset_at")
        .single();

      return resetData || { quota_remaining: 10000, quota_reset_at: new Date(new Date().setHours(24, 0, 0, 0)).toISOString() };
    }

    return data;
  } catch (error) {
    console.error("Error in checkQuota:", error);
    // Default to allowing some quota if the function fails
    return { quota_remaining: 1000, quota_reset_at: new Date().toISOString() };
  }
}

export async function updateQuotaUsage(quotaUsed: number) {
  try {
    const { error } = await supabase
      .from("api_quota_tracking")
      .update({
        quota_remaining: supabase.rpc("decrement_quota", { quota_amount: quotaUsed })
      })
      .eq("api_name", "youtube");

    if (error) {
      console.error("Error updating quota:", error);
    }
  } catch (error) {
    console.error("Error in updateQuotaUsage:", error);
  }
}

