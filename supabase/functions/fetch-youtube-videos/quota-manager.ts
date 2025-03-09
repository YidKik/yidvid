
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase client for server-side operations
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Checks the current YouTube API quota status
 */
export async function checkQuota() {
  try {
    // Default quota values if we can't fetch them
    let quotaRemaining = 5000; // Conservative default
    let quotaResetAt = new Date();
    quotaResetAt.setDate(quotaResetAt.getDate() + 1); // Reset tomorrow by default
    
    // Get current quota from database
    const { data, error } = await supabase
      .from('api_quota_tracking')
      .select('quota_remaining, quota_reset_at')
      .eq('api_name', 'youtube')
      .single();
    
    if (error) {
      console.error('Error checking quota:', error.message);
    } else if (data) {
      quotaRemaining = data.quota_remaining;
      quotaResetAt = new Date(data.quota_reset_at);
      
      // If we're past reset time, reset the quota
      if (new Date() >= quotaResetAt) {
        quotaRemaining = 10000; // YouTube's daily quota
        quotaResetAt = new Date();
        quotaResetAt.setDate(quotaResetAt.getDate() + 1);
        
        // Update the reset quota
        await supabase
          .from('api_quota_tracking')
          .update({
            quota_remaining: quotaRemaining,
            quota_reset_at: quotaResetAt.toISOString()
          })
          .eq('api_name', 'youtube');
      }
    }
    
    return {
      quota_remaining: quotaRemaining,
      quota_reset_at: quotaResetAt.toISOString()
    };
  } catch (err) {
    console.error('Error in checkQuota:', err);
    // Return conservative defaults
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      quota_remaining: 1000,
      quota_reset_at: tomorrow.toISOString()
    };
  }
}

/**
 * Updates the used quota in the database
 */
export async function updateQuotaUsage(usedQuota: number) {
  try {
    const { data, error } = await supabase
      .from('api_quota_tracking')
      .select('quota_remaining')
      .eq('api_name', 'youtube')
      .single();
    
    if (error) {
      console.error('Error getting current quota:', error.message);
      return;
    }
    
    const remainingQuota = Math.max(0, data.quota_remaining - usedQuota);
    
    const { error: updateError } = await supabase
      .from('api_quota_tracking')
      .update({ quota_remaining: remainingQuota })
      .eq('api_name', 'youtube');
    
    if (updateError) {
      console.error('Error updating quota:', updateError.message);
    }
  } catch (err) {
    console.error('Error in updateQuotaUsage:', err);
  }
}
