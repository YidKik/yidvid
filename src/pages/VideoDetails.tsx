import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoInfo } from "@/components/video/VideoInfo";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentList } from "@/components/comments/CommentList";
import { RelatedVideos } from "@/components/video/RelatedVideos";
import { VideoCommentsTable } from "@/integrations/supabase/types/video-comments";
import { BackButton } from "@/components/navigation/BackButton";

type Comment = VideoCommentsTable["Row"] & {
  profiles: {
    email: string;
  } | null;
};

const VideoDetails = () => {
  const { id } = useParams();

  const { data: video, isLoading: isLoadingVideo } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const { data: videoData, error: videoError } = await supabase
        .from("youtube_videos")
        .select("*, youtube_channels(thumbnail_url)")
        .eq("id", id)
        .single();

      if (videoError) throw videoError;
      return videoData;
    },
  });

  const { data: channelVideos } = useQuery({
    queryKey: ["channel-videos", video?.channel_id],
    enabled: !!video?.channel_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("channel_id", video.channel_id)
        .neq("id", id)
        .order("uploaded_at", { ascending: false })
        .limit(12);

      if (error) throw error;
      return data;
    },
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["video-comments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_comments")
        .select(`
          *,
          profiles (
            email
          )
        `)
        .eq("video_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Comment[];
    },
  });

  const handleSubmitComment = async (content: string) => {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("video_comments").insert({
      video_id: id,
      content,
      user_id: session.data.session.user.id,
    });

    if (error) {
      console.error("Error submitting comment:", error);
      throw error;
    }

    await refetchComments();
  };

  if (isLoadingVideo) {
    return <div className="p-4">Loading...</div>;
  }

  if (!video) {
    return <div className="p-4">Video not found</div>;
  }

  return (
    <div className="container mx-auto p-4 mt-16">
      <BackButton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <VideoPlayer videoId={video.video_id} />
          <VideoInfo
            title={video.title}
            channelName={video.channel_name}
            channelThumbnail={video.youtube_channels?.thumbnail_url}
            views={video.views}
            uploadedAt={video.uploaded_at}
          />
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            <CommentForm onSubmit={handleSubmitComment} />
            <CommentList comments={comments} />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <RelatedVideos videos={channelVideos} />
        </div>
      </div>
    </div>
  );
};

export default VideoDetails;
