
import { checkApiQuota } from "../useApiQuota";

/**
 * Check if we have sufficient quota to make requests
 */
export const hasSufficientQuota = async (
  highPriority: boolean = false
): Promise<boolean> => {
  try {
    const quotaInfo = await checkApiQuota();
    console.log("Current quota status:", quotaInfo);
    
    // If quota info is null, continue anyway
    if (quotaInfo === null) {
      return true;
    }
    
    // If quota is exhausted, always return false
    if (quotaInfo.quota_remaining <= 0) {
      return false;
    }
    
    // Be more aggressive with quota if high priority, otherwise be conservative
    const minQuotaRequired = highPriority ? 100 : 500;
    
    // Only proceed if we have sufficient quota remaining
    return quotaInfo.quota_remaining >= minQuotaRequired;
  } catch (error) {
    console.warn("Could not check quota:", error);
    // Continue anyway if we can't check
    return true;
  }
};

