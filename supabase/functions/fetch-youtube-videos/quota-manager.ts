
import { supabase } from './db-operations.ts';

export interface QuotaInfo {
  quota_limit: number;
  quota_remaining: number;
  quota_reset_at: string;
  last_reset: string;
}

export const getQuotaInfo = async (): Promise<QuotaInfo | null> => {
  try {
    const { data, error } = await supabase
      .from('api_quota_tracking')
      .select('*')
      .eq('api_name', 'youtube')
      .single();

    if (error) {
      console.error('Error fetching quota info:', error);
      return null;
    }

    return {
      quota_limit: data.quota_limit,
      quota_remaining: data.quota_remaining,
      quota_reset_at: data.quota_reset_at,
      last_reset: data.last_reset
    };
  } catch (error) {
    console.error('Unexpected error in getQuotaInfo:', error);
    return null;
  }
};

export const updateQuotaRemaining = async (used: number): Promise<boolean> => {
  try {
    const { data: current, error: fetchError } = await supabase
      .from('api_quota_tracking')
      .select('quota_remaining')
      .eq('api_name', 'youtube')
      .single();

    if (fetchError) {
      console.error('Error fetching current quota:', fetchError);
      return false;
    }

    const newRemaining = Math.max(0, current.quota_remaining - used);
    
    const { error: updateError } = await supabase
      .from('api_quota_tracking')
      .update({ 
        quota_remaining: newRemaining,
        updated_at: new Date().toISOString()
      })
      .eq('api_name', 'youtube');

    if (updateError) {
      console.error('Error updating quota:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in updateQuotaRemaining:', error);
    return false;
  }
};

export const recordFetchAttempt = async (
  channelsProcessed: number,
  videosFound: number,
  error?: string,
  quotaRemaining?: number
): Promise<void> => {
  try {
    await supabase.from('video_fetch_logs').insert({
      channels_processed: channelsProcessed,
      videos_found: videosFound,
      error: error,
      quota_remaining: quotaRemaining
    });
  } catch (err) {
    console.error('Error recording fetch attempt:', err);
  }
};
