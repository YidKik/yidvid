
import { supabase } from "@/integrations/supabase/client";

export interface QuotaInfo {
  api_name: string;
  quota_limit: number;
  quota_remaining: number;
  quota_reset_at: string;
  last_reset: string;
  updated_at: string;
}

/**
 * Check the current API quota status
 */
export const checkApiQuota = async (): Promise<QuotaInfo | null> => {
  try {
    const { data, error } = await supabase
      .from("api_quota_tracking")
      .select("*")
      .eq("api_name", "youtube")
      .single();

    if (error) {
      console.error("Error checking API quota:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Failed to check API quota:", err);
    return null;
  }
};

/**
 * Get quota percentage and status
 */
export const getQuotaStatus = async (): Promise<{
  percentage: number;
  isLow: boolean;
  resetTime: Date | null;
} | null> => {
  const quotaInfo = await checkApiQuota();
  if (!quotaInfo) return null;
  
  const percentage = Math.floor((quotaInfo.quota_remaining / quotaInfo.quota_limit) * 100);
  const isLow = percentage < 20; // Consider quota low if less than 20% remaining
  const resetTime = new Date(quotaInfo.quota_reset_at);
  
  return { percentage, isLow, resetTime };
};
