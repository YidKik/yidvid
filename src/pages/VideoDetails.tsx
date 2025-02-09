
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoInfo } from "@/components/video/VideoInfo";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentList } from "@/components/comments/CommentList";
import { RelatedVideos } from "@/components/video/RelatedVideos";
import { VideoCommentsTable } from "@/integrations/supabase/types/video-comments";
import { BackButton } from "@/components/navigation/BackButton";
import { VideoInteractions } from "@/components/video/VideoInteractions";
import { ReportVideoDialog } from "@/components/video/ReportVideoDialog";

type Comment = VideoCommentsTable["Row"] & {
  profiles: {
    email: string;
    name: string | null;
  } | null;
};

const VideoDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: video, isLoading: isLoadingVideo } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      if (!id) throw new Error("No video ID provided");

      console.log("Attempting to fetch video with ID:", id);

      // First try to find by video_id
      const { data: videoByVideoId, error: videoByVideoIdError } = await supabase
        .from("youtube_videos")
        .select("*, youtube_channels(thumbnail_url)")
        .eq("video_id", id)
        .maybeSingle();

      if (videoByVideoIdError) {
        console.error("Error fetching video by video_id:", videoByVideoIdError);
        throw videoByVideoIdError;
      }

      if (videoByVideoId) {
        console.log("Found video by video_id:", videoByVideoId);
        return videoByVideoId;
      }

      // Check if the id is a valid UUID before querying
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new Error("Invalid video ID format");
      }

      // If not found by video_id, try UUID
      const { data: videoByUuid, error: videoByUuidError } = await supabase
        .from("youtube_videos")
        .select("*, youtube_channels(thumbnail_url)")
        .eq("id", id)
        .maybeSingle();

      if (videoByUuidError) {
        console.error("Error fetching video by UUID:", videoByUuidError);
        throw videoByUuidError;
      }

      if (!videoByUuid) {
        throw new Error("Video not found");
      }

      console.log("Found video by UUID:", videoByUuid);
      return videoByUuid;
    },
    retry: false,
  });

  const { data: channelVideos } = useQuery({
    queryKey: ["channel-videos", video?.channel_id],
    enabled: !!video?.channel_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("channel_id", video.channel_id)
        .neq("id", video.id) // Changed from video_id to id
        .order("uploaded_at", { ascending: false })
        .limit(12);

      if (error) throw error;
      return data;
    },
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["video-comments", video?.id],
    enabled: !!video?.id,
    queryFn: async () => {
      if (!video?.id) throw new Error("No video UUID available");

      const { data, error } = await supabase
        .from("video_comments")
        .select(`
          *,
          profiles (
            email,
            name
          )
        `)
        .eq("video_id", video.id)
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

    if (!video?.id) {
      toast("Error", {
        description: "Cannot add comment: video not found"
      });
      return;
    }

    const { error } = await supabase.from("video_comments").insert({
      video_id: video.id,
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
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-base md:text-2xl font-bold">{video.title}</h1>
            <ReportVideoDialog videoId={video.id} />
          </div>
          
          <VideoInteractions videoId={video.id} />
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            <CommentForm onSubmit={handleSubmitComment} />
            <CommentList comments={comments} />
          </div>

          <div className="mt-8 border-t pt-8">
            <VideoInfo
              title={video.title}
              channelName={video.channel_name}
              channelThumbnail={video.youtube_channels?.thumbnail_url}
              views={video.views}
              uploadedAt={video.uploaded_at}
              description={video.description}
            />
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
