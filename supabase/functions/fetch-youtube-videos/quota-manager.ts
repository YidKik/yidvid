
export const checkAndUpdateQuota = async (supabaseClient: any) => {
  try {
    // First try to get the current quota status
    const { data: quotaData, error: quotaError } = await supabaseClient
      .from('api_quota_tracking')
      .select('*')
      .eq('api_name', 'youtube')
      .single();

    if (quotaError) {
      console.error('Error checking quota:', quotaError);
      throw quotaError;
    }

    if (!quotaData) {
      // If no quota record exists, create one
      const { data: newQuota, error: insertError } = await supabaseClient
        .from('api_quota_tracking')
        .insert([{
          api_name: 'youtube',
          quota_limit: 10000,
          quota_remaining: 10000,
          quota_reset_at: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
          last_reset: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating quota record:', insertError);
        throw insertError;
      }

      return {
        canProceed: true,
        quotaData: newQuota
      };
    }

    // Check if we need to reset the quota
    const now = new Date();
    const resetTime = new Date(quotaData.quota_reset_at);

    if (now >= resetTime) {
      // Reset the quota
      const { data: updatedQuota, error: updateError } = await supabaseClient
        .from('api_quota_tracking')
        .update({
          quota_remaining: quotaData.quota_limit,
          quota_reset_at: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
          last_reset: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('api_name', 'youtube')
        .select()
        .single();

      if (updateError) {
        console.error('Error resetting quota:', updateError);
        throw updateError;
      }

      return {
        canProceed: true,
        quotaData: updatedQuota
      };
    }

    // Check if we have remaining quota
    if (quotaData.quota_remaining <= 0) {
      return {
        canProceed: false,
        quotaData
      };
    }

    return {
      canProceed: true,
      quotaData
    };
  } catch (error) {
    console.error('Error in checkAndUpdateQuota:', error);
    throw error;
  }
};

export const decrementQuota = async (supabaseClient: any, amount = 1) => {
  try {
    const { data, error } = await supabaseClient
      .from('api_quota_tracking')
      .update({
        quota_remaining: supabaseClient.rpc('decrement', { x: amount }),
        updated_at: new Date().toISOString()
      })
      .eq('api_name', 'youtube')
      .select()
      .single();

    if (error) {
      console.error('Error decrementing quota:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in decrementQuota:', error);
    throw error;
  }
};
