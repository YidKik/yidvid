
import { toast as mainToast, useToast as useMainToast } from "@/hooks/use-toast";

// Forward all toast functions to the main implementation
export const useToast = useMainToast;

// Forward all toast functions to the main implementation
export const toast = {
  success: mainToast.success,
  error: mainToast.error,
  warning: mainToast.warning,
  info: mainToast.info,
  loading: mainToast.loading,
  dismiss: mainToast.dismiss,
  custom: mainToast.custom,
};
