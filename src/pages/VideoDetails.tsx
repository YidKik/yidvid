import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { VideoCard } from "@/components/VideoCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const VideoDetails = () => {
  const { id } = useParams();
  const [comment, setComment] = useState("");

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
      return data.map((video) => ({
        ...video,
        channelName: video.channel_name,
        uploadedAt: new Date(video.uploaded_at),
      }));
    },
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["video-comments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_comments")
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            email
          )
        `)
        .eq("video_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("video_comments").insert({
      video_id: id,
      content: comment,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    });

    if (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setComment("");
    refetchComments();
    toast({
      title: "Success",
      description: "Comment posted successfully",
    });
  };

  if (isLoadingVideo) {
    return <div className="p-4">Loading...</div>;
  }

  if (!video) {
    return <div className="p-4">Video not found</div>;
  }

  return (
    <div className="container mx-auto p-4 mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="aspect-video w-full mb-4">
            <iframe
              src={`https://www.youtube.com/embed/${video.video_id}`}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
          <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={video.youtube_channels?.thumbnail_url || ''} alt={video.channel_name} />
                <AvatarFallback>{video.channel_name[0]}</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground">{video.channel_name}</p>
            </div>
            <p className="text-muted-foreground">
              {video.views?.toLocaleString()} views •{" "}
              {formatDistanceToNow(new Date(video.uploaded_at), { addSuffix: true })}
            </p>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            <form onSubmit={handleSubmitComment} className="mb-6">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="mb-2"
              />
              <Button type="submit">Post Comment</Button>
            </form>
            
            <div className="space-y-4">
              {comments?.map((comment) => (
                <div key={comment.id} className="border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">
                      {comment.profiles?.email || "Anonymous"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">More from {video.channel_name}</h2>
          <div className="space-y-4">
            {channelVideos?.map((video) => (
              <VideoCard key={video.id} {...video} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetails;