
import { ProfilesTable } from "@/integrations/supabase/types/profiles";

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const getUserDisplayName = (user: ProfilesTable["Row"]) => {
  return user.username || user.display_name || user.name || 'Unnamed User';
};

export const getUserDevice = (user: ProfilesTable["Row"]) => {
  const lastChar = user.id.charAt(user.id.length - 1);
  const numValue = parseInt(lastChar, 16);
  return numValue % 2 === 0 ? "desktop" : "mobile";
};
