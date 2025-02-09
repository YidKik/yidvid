
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
  // First check if user is authenticated
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error);
        return null;
      }
      return session;
    },
  });

  // Then check if user is admin
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile error:", error);
        return null;
      }
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Only fetch notifications if user is authenticated and is admin
  const { data: notifications, refetch: refetchNotificationsQuery } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      if (!session?.user?.id || !profile?.is_admin) {
        return [];
      }

      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .eq("type", "new_comment")
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        toast({
          title: "Error fetching notifications",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data as AdminNotification[];
    },
    enabled: !!session?.user?.id && !!profile?.is_admin && !isSessionLoading && !isProfileLoading,
  });

  // Only fetch comments if user is authenticated and is admin
  const { data: comments, refetch: refetchCommentsQuery } = useQuery({
    queryKey: ["all-comments"],
    queryFn: async () => {
      if (!session?.user?.id || !profile?.is_admin) {
        return [];
      }

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
        console.error("Error fetching comments:", error);
        toast({
          title: "Error fetching comments",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data as Comment[];
    },
    enabled: !!session?.user?.id && !!profile?.is_admin && !isSessionLoading && !isProfileLoading,
  });

  const handleDeleteComment = async (commentId: string) => {
    if (!session?.user?.id || !profile?.is_admin) {
      toast({
        title: "Permission denied",
        description: "Only admins can delete comments",
        variant: "destructive",
      });
      return;
    }

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
      console.error("Error deleting comment:", error);
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
