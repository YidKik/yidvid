
/**
 * Copy content to clipboard without showing any toast notification
 * @param content Text to copy to clipboard
 * @param label Label for success message
 */
export const copyToClipboard = (content: string, label: string): void => {
  if (!content) return;
  
  navigator.clipboard.writeText(content)
    .catch((error) => console.error(`Failed to copy ${label.toLowerCase()}:`, error));
};
