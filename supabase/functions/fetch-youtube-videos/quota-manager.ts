
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const checkAndUpdateQuota = async (
  supabase: SupabaseClient,
  cost: number = 1
): Promise<{ canProceed: boolean; quotaData: any }> => {
  try {
    // Get current quota status
    const { data: quotaData, error: quotaError } = await supabase
      .from('api_quota_tracking')
      .select('*')
      .single();

    if (quotaError) {
      console.error('Error fetching quota data:', quotaError);
      throw quotaError;
    }

    const now = new Date();
    const resetTime = new Date(quotaData.quota_reset_at);

    // Force reset if we're past the reset time
    if (now > resetTime) {
      console.log('Resetting quota as current time is past reset time');
      console.log('Current time:', now.toISOString());
      console.log('Reset time was:', resetTime.toISOString());

      // Update quota and reset time
      const { data: updatedQuota, error: updateError } = await supabase
        .from('api_quota_tracking')
        .update({
          quota_remaining: 10000,
          quota_reset_at: new Date(now.getTime() + (24 * 60 * 60 * 1000)).toISOString(),
          last_reset: now.toISOString()
        })
        .eq('id', quotaData.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating quota:', updateError);
        throw updateError;
      }

      return {
        canProceed: true,
        quotaData: updatedQuota
      };
    }

    // Check if we have enough quota
    const hasQuota = quotaData.quota_remaining >= cost;

    if (hasQuota) {
      // Deduct quota
      const { data: updatedQuota, error: updateError } = await supabase
        .from('api_quota_tracking')
        .update({
          quota_remaining: quotaData.quota_remaining - cost
        })
        .eq('id', quotaData.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating quota:', updateError);
        throw updateError;
      }

      return {
        canProceed: true,
        quotaData: updatedQuota
      };
    }

    return {
      canProceed: false,
      quotaData
    };
  } catch (error) {
    console.error('Error in quota management:', error);
    throw error;
  }
};

export const getQuotaStatus = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from('api_quota_tracking')
    .select('*')
    .single();

  if (error) {
    console.error('Error getting quota status:', error);
    throw error;
  }

  return data;
};
