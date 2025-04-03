
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminNotification } from "@/types/dashboard";

/**
 * Custom hook to fetch admin notifications
 */
export const useAdminNotifications = (isAdmin: boolean) => {
  // Query notifications only if user is admin
  const { data: notifications } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      console.log("Fetching admin notifications...");
      try {
        const { data: notificationsData, error } = await supabase
          .from("admin_notifications")
          .select("*")
          .eq("is_read", false);

        if (error) {
          console.error("Error fetching notifications:", error);
          return [];
        }

        return notificationsData;
      } catch (error) {
        console.error("Notifications fetch error:", error);
        return [];
      }
    },
    enabled: isAdmin,
    refetchInterval: 30000,
    staleTime: 10000, // Shorter stale time for notifications
    retry: 2,
  });

  return { notifications };
};
