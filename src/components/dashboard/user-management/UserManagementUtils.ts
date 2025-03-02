
import { ProfilesTable } from "@/integrations/supabase/types/profiles";
import { supabase } from "@/integrations/supabase/client";

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

export const updateUsername = async (userId: string, newUsername: string) => {
  try {
    console.log(`Attempting to update username for user ${userId} to ${newUsername}`);
    
    // First, check if the current user is an admin
    const { data: currentUser, error: currentUserError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", await supabase.auth.getUser().then(res => res.data.user?.id || ''))
      .single();

    if (currentUserError) {
      console.error("Error checking admin status:", currentUserError);
      return { success: false, error: `Admin check failed: ${currentUserError.message}` };
    }

    if (!currentUser?.is_admin) {
      console.error("Permission denied: User is not an admin");
      return { success: false, error: "Only admins can update usernames" };
    }

    // Now update the profile
    const { data, error } = await supabase
      .from("profiles")
      .update({ username: newUsername })
      .eq("id", userId)
      .select();
    
    if (error) {
      console.error("Error updating username in profiles table:", error);
      return { success: false, error: error.message };
    }

    console.log("Username updated successfully:", data);
    return { success: true, data };
  } catch (error: any) {
    console.error("Unexpected error updating username:", error);
    return { success: false, error: error.message };
  }
};
