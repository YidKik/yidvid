
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Notification {
  id: string;
  message: string;
  type: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

interface NotificationsTableProps {
  notifications: Notification[];
  isLoading: boolean;
}

export const NotificationsTable = ({ notifications, isLoading }: NotificationsTableProps) => {
  const queryClient = useQueryClient();

  const toggleNotification = useMutation({
    mutationFn: async (id: string) => {
      const notification = notifications.find((n) => n.id === id);
      if (!notification) throw new Error("Notification not found");

      const { error } = await supabase
        .from("global_notifications")
        .update({ is_active: !notification.is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-notifications"] });
      toast.success("Notification status updated");
    },
    onError: (error) => {
      console.error("Error toggling notification:", error);
      toast.error("Failed to update notification status");
    },
  });

  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Message</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notifications?.map((notification) => (
          <TableRow key={notification.id}>
            <TableCell>{notification.message}</TableCell>
            <TableCell className="capitalize">{notification.type}</TableCell>
            <TableCell>{format(new Date(notification.start_date), "PPp")}</TableCell>
            <TableCell>
              {notification.end_date
                ? format(new Date(notification.end_date), "PPp")
                : "No end date"}
            </TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  notification.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {notification.is_active ? "Active" : "Inactive"}
              </span>
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleNotification.mutate(notification.id)}
              >
                {notification.is_active ? "Deactivate" : "Activate"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
