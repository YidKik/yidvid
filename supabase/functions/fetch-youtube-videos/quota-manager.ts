
import { supabaseAdmin } from "./db-operations.ts";

/**
 * Check the current YouTube API quota status
 */
export async function checkQuota() {
  try {
    const { data, error } = await supabaseAdmin
      .from('api_quota_tracking')
      .select('quota_remaining, quota_reset_at')
      .eq('api_name', 'youtube')
      .single();

    if (error) {
      console.error('Error checking quota:', error);
      // Default to a conservative quota limit if we can't check
      return { quota_remaining: 1000, quota_reset_at: new Date().toISOString() };
    }

    return {
      quota_remaining: data.quota_remaining,
      quota_reset_at: data.quota_reset_at
    };
  } catch (error) {
    console.error('Unexpected error checking quota:', error);
    // Return conservative estimate
    return { quota_remaining: 1000, quota_reset_at: new Date().toISOString() };
  }
}

/**
 * Update the YouTube API quota usage
 */
export async function updateQuotaUsage(quotaUsed: number) {
  if (!quotaUsed || quotaUsed <= 0) return;

  try {
    const { error } = await supabaseAdmin.rpc('decrement_api_quota', {
      api_name_param: 'youtube',
      quota_used: quotaUsed
    });

    if (error) {
      console.error('Error updating quota usage:', error);
    }
  } catch (error) {
    console.error('Unexpected error updating quota:', error);
  }
}
