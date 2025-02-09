
import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  video_id: string;
  profiles: {
    email: string;
    name: string | null;
  } | null;
  youtube_videos: {
    title: string;
  } | null;
}

interface AdminNotification {
  id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface CommentsContextType {
  comments?: Comment[];
  notifications?: AdminNotification[];
  refetchComments: () => Promise<void>;
  refetchNotifications: () => Promise<void>;
  handleDeleteComment: (commentId: string) => Promise<void>;
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

export const useComments = () => {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error("useComments must be used within a CommentsProvider");
  }
  return context;
};

export const CommentsProvider = ({ children }: { children: ReactNode }) => {
  const { data: notifications, refetch: refetchNotificationsQuery } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .eq("type", "new_comment")
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching notifications",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data as AdminNotification[];
    },
  });

  const { data: comments, refetch: refetchCommentsQuery } = useQuery({
    queryKey: ["all-comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_comments")
        .select(`
          *,
          profiles (
            email,
            name
          ),
          youtube_videos (
            title
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching comments",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data as Comment[];
    },
  });

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("video_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
      
      await refetchComments();
      await refetchNotifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error deleting comment: " + error.message,
        variant: "destructive",
      });
    }
  };

  const refetchComments = async () => {
    await refetchCommentsQuery();
  };

  const refetchNotifications = async () => {
    await refetchNotificationsQuery();
  };

  return (
    <CommentsContext.Provider
      value={{
        comments,
        notifications,
        refetchComments,
        refetchNotifications,
        handleDeleteComment,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
};
