import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentList } from "@/components/comments/CommentList";
import { VideoCommentsTable } from "@/integrations/supabase/types/video-comments";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

type Comment = VideoCommentsTable["Row"] & {
  profiles: {
    email: string;
    name?: string;
    display_name?: string;
  } | null;
};

interface VideoCommentsProps {
  videoId: string;
}

export const VideoComments = ({ videoId }: VideoCommentsProps) => {
  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["video-comments", videoId],
    enabled: !!videoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_comments")
        .select(`
          *,
          profiles (
            email,
            name,
            display_name
          ),
          youtube_videos (
            title
          )
        `)
        .eq("video_id", videoId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Comment[];
    },
  });

  const handleSubmitComment = async (content: string) => {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      toast("Error", {
        description: "You must be logged in to comment"
      });
      return;
    }

    const { error } = await supabase.from("video_comments").insert({
      video_id: videoId,
      content,
      user_id: session.data.session.user.id,
    });

    if (error) {
      console.error("Error submitting comment:", error);
      throw error;
    }

    await refetchComments();
    toast.success("Comment posted! 🎉");
  };

  return (
    <div className="space-y-4">
      {/* Comment Form Section */}
      <div className="bg-white rounded-xl p-4 border border-[#E5E5E5]">
        <CommentForm onSubmit={handleSubmitComment} />
      </div>
      
      {/* Comments List */}
      <div className="space-y-3">
        {comments && comments.length > 0 ? (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
              <MessageSquare className="h-4 w-4" />
              <span>{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
            </div>
            <CommentList comments={comments} />
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-[#F5F5F5] rounded-full flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-muted-foreground text-sm">
              Be the first to comment! ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
};