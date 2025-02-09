
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CommentsProvider } from "./comments/CommentsContext";
import { NotificationsBadge } from "./comments/NotificationsBadge";
import { CommentsTable } from "./comments/CommentsTable";

export const CommentsManagementSection = () => {
  const setupRealtimeSubscription = (callback: () => void) => {
    const channel = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_comments'
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <CommentsProvider>
      <CommentsManagementContent setupRealtimeSubscription={setupRealtimeSubscription} />
    </CommentsProvider>
  );
};

const CommentsManagementContent = ({
  setupRealtimeSubscription
}: {
  setupRealtimeSubscription: (callback: () => void) => () => void;
}) => {
  const { refetchComments, refetchNotifications } = useComments();

  useEffect(() => {
    return setupRealtimeSubscription(() => {
      refetchComments();
      refetchNotifications();
    });
  }, [refetchComments, refetchNotifications]);

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Comments Management</h2>
          <NotificationsBadge />
        </div>
      </div>
      <CommentsTable />
    </div>
  );
};
