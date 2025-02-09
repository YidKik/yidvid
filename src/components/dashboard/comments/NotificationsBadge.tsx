
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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
      refetchNotifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error marking notifications as read: " + error.message,
        variant: "destructive",
      });
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
