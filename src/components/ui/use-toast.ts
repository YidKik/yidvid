
// We're standardizing on sonner for toast notifications to prevent duplicates
import { toast } from "sonner";

// Re-export useToast from hooks directory for backward compatibility
import { useToast } from "@/hooks/use-toast";

// Re-export both toast and useToast for consistent usage across the app
export { toast, useToast };
