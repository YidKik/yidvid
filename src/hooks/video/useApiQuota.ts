
import { supabase } from "@/integrations/supabase/client";

export interface QuotaInfo {
  api_name: string;
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
