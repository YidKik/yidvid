
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useComments } from "./CommentsContext";

export const NotificationsBadge = () => {
  const { notifications, refetchNotifications } = useComments();

  const markNotificationsAsRead = async () => {
    try {
      const { error } = await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .eq("type", "new_comment")
        .eq("is_read", false);

      if (error) throw error;
      await refetchNotifications();
      toast.success("Notifications marked as read");
    } catch (error: any) {
      console.error("Error marking notifications as read:", error);
      toast.error("Error marking notifications as read: " + error.message);
    }
  };

  if (!notifications || notifications.length === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className="flex items-center gap-1 cursor-pointer hover:bg-destructive/90 transition-colors"
      onClick={markNotificationsAsRead}
    >
      <Bell className="h-3 w-3" />
      {notifications.length} new
    </Badge>
  );
};
