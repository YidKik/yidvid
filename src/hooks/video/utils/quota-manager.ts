
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
    
    // Be more aggressive with quota if high priority, otherwise be conservative
    const minQuotaRequired = highPriority ? 500 : 1000;
    
    // Only proceed if we have sufficient quota remaining or if we couldn't check quota
    return quotaInfo === null || quotaInfo.quota_remaining >= minQuotaRequired || highPriority;
  } catch (error) {
    console.warn("Could not check quota:", error);
    // Continue anyway if we can't check
    return true;
  }
};
