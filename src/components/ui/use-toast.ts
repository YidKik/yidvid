
// We're standardizing on sonner for toast notifications to prevent duplicates
import { toast as sonnerToast } from "sonner";

// Wrapper for toast to prevent duplicate messages
const toast = {
  // Store already shown messages/errors
  activeToasts: new Set<string>(),
  
  // Custom success method with deduplication
  success: (message: string, options?: any) => {
    const id = options?.id || message;
    if (toast.activeToasts.has(id)) return;
    
    toast.activeToasts.add(id);
    sonnerToast.success(message, {
      ...options,
      duration: options?.duration || 4000, // Default to 4 seconds
      onDismiss: () => {
        toast.activeToasts.delete(id);
        options?.onDismiss?.();
      }
    });
  },
  
  // Custom error method with deduplication
  error: (message: string, options?: any) => {
    const id = options?.id || message;
    if (toast.activeToasts.has(id)) return;
    
    toast.activeToasts.add(id);
    sonnerToast.error(message, {
      ...options,
      duration: options?.duration || 4000, // Default to 4 seconds
      onDismiss: () => {
        toast.activeToasts.delete(id);
        options?.onDismiss?.();
      }
    });
  },
  
  // Custom info method with deduplication
  info: (message: string, options?: any) => {
    const id = options?.id || message;
    if (toast.activeToasts.has(id)) return;
    
    toast.activeToasts.add(id);
    sonnerToast.info(message, {
      ...options,
      duration: options?.duration || 4000, // Default to 4 seconds
      onDismiss: () => {
        toast.activeToasts.delete(id);
        options?.onDismiss?.();
      }
    });
  },
  
  // Custom warning method with deduplication
  warning: (message: string, options?: any) => {
    const id = options?.id || message;
    if (toast.activeToasts.has(id)) return;
    
    toast.activeToasts.add(id);
    sonnerToast.warning(message, {
      ...options,
      duration: options?.duration || 4000, // Default to 4 seconds
      onDismiss: () => {
        toast.activeToasts.delete(id);
        options?.onDismiss?.();
      }
    });
  },
  
  // Pass through for the dismiss method
  dismiss: sonnerToast.dismiss,
  
  // Pass through for any custom toasts
  custom: sonnerToast.custom,
  
  // Promise method with deduplication
  promise: (promise: Promise<any>, options: any) => {
    const id = options?.id || JSON.stringify(options.loading);
    if (toast.activeToasts.has(id)) return promise;
    
    toast.activeToasts.add(id);
    sonnerToast.promise(promise, {
      ...options,
      duration: options?.duration || 4000, // Default to 4 seconds
      finally: () => {
        toast.activeToasts.delete(id);
        options?.finally?.();
      }
    });
    
    return promise;
  }
};

// Re-export useToast from hooks directory for backward compatibility
import { useToast } from "@/hooks/use-toast";

// Re-export both toast and useToast for consistent usage across the app
export { toast, useToast };
