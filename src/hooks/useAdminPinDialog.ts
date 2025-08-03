
import { useSecureAdminAuth } from "./useSecureAdminAuth";

/**
 * @deprecated This hook contains security vulnerabilities and is replaced by useSecureAdminAuth
 * Please use useSecureAdminAuth instead for secure admin authentication
 */
export const useAdminPinDialog = (userId?: string) => {
  console.warn("useAdminPinDialog is deprecated due to security vulnerabilities. Use useSecureAdminAuth instead.");
  return useSecureAdminAuth();
};
