
import { toast } from "sonner";

/**
 * Copy content to clipboard and show a toast notification
 * @param content Text to copy to clipboard
 * @param label Label for success message
 */
export const copyToClipboard = (content: string, label: string): void => {
  if (!content) return;
  
  navigator.clipboard.writeText(content)
    .then(() => toast.success(`${label} copied to clipboard`))
    .catch(() => toast.error(`Failed to copy ${label.toLowerCase()}`));
};
