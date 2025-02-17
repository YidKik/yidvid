
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateNotificationForm } from "./notifications/CreateNotificationForm";
import { NotificationsTable } from "./notifications/NotificationsTable";

export const GlobalNotificationsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["global-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Global Notifications
        </h2>
        <Button onClick={() => setIsDialogOpen(true)}>Add Notification</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Notification</DialogTitle>
          </DialogHeader>
          <CreateNotificationForm onClose={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <NotificationsTable notifications={notifications || []} isLoading={isLoading} />
    </div>
  );
};
