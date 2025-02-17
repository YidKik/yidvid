
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './utils.ts';

export interface QuotaData {
  quota_remaining: number;
  quota_reset_at: string;
}

export const checkQuota = async (supabase: SupabaseClient): Promise<QuotaData> => {
  const { data, error } = await supabase
    .from('api_quota_tracking')
    .select('quota_remaining, quota_reset_at')
    .eq('api_name', 'youtube')
    .single();

  if (error) {
    console.error('Error checking quota:', error);
    throw new Error('Failed to check API quota');
  }

  return data;
};

export const updateQuota = async (
  supabase: SupabaseClient, 
  currentQuota: number,
  now: Date
): Promise<void> => {
  if (currentQuota > 0) {
    await supabase
      .from('api_quota_tracking')
      .update({ 
        quota_remaining: currentQuota - 1,
        updated_at: now.toISOString()
      })
      .eq('api_name', 'youtube')
      .single();
  }
};

export const setQuotaExceeded = async (
  supabase: SupabaseClient,
  now: Date
): Promise<void> => {
  await supabase
    .from('api_quota_tracking')
    .update({ 
      quota_remaining: 0,
      updated_at: now.toISOString()
    })
    .eq('api_name', 'youtube')
    .single();
};

export const createQuotaExceededResponse = (quotaResetAt: string, processedVideos = [], errors = []) => {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'YouTube API quota exceeded',
      message: `Daily quota exceeded. Service will resume at ${new Date(quotaResetAt).toUTCString()}`,
      processed: processedVideos.length,
      errors,
      quota_reset_at: quotaResetAt
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 429
    }
  );
};
