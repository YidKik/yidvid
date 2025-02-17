import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentList } from "@/components/comments/CommentList";
import { VideoCommentsTable } from "@/integrations/supabase/types/video-comments";
import { toast } from "sonner";

type Comment = VideoCommentsTable["Row"] & {
  profiles: {
    email: string;
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
            email
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
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>
      <CommentForm onSubmit={handleSubmitComment} />
      <CommentList comments={comments} />
    </div>
  );
};
