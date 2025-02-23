import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddVideoFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  videoUrl: string;
  title: string;
  channelName: string;
}

export const AddVideoForm = ({ onClose, onSuccess }: AddVideoFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      console.log("Adding video with values:", values);

      // Extract video ID from URL
      const videoId = values.videoUrl.split("v=")[1]?.split("&")[0] || values.videoUrl.split("/").pop();
      if (!videoId) {
        toast.error("Invalid video URL");
        return;
      }

      // First analyze the video content
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('analyze-video-content', {
        body: {
          title: values.title,
          description: `Channel: ${values.channelName}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        }
      });

      if (analysisError || !analysisResult?.approved) {
        console.error("Content moderation failed:", analysisError || analysisResult);
        toast.error("Video content does not meet community guidelines");
        return;
      }

      // First, check if channel exists
      const { data: channel, error: channelError } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("channel_id", values.channelName.toLowerCase())
        .maybeSingle();

      if (channelError) {
        console.error("Error checking channel:", channelError);
        toast.error("Error checking channel");
        return;
      }

      // If channel doesn't exist, create it
      if (!channel) {
        const { error: createChannelError } = await supabase
          .from("youtube_channels")
          .insert({
            channel_id: values.channelName.toLowerCase(),
            title: values.channelName,
            description: `Channel for ${values.channelName}`
          });

        if (createChannelError) {
          console.error("Error creating channel:", createChannelError);
          toast.error("Error creating channel");
          return;
        }
      }

      // Now add the video
      const { error: videoError } = await supabase
        .from("youtube_videos")
        .insert({
          video_id: videoId,
          title: values.title,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          channel_id: values.channelName.toLowerCase(),
          channel_name: values.channelName,
          uploaded_at: new Date().toISOString()
        });

      if (videoError) {
        console.error("Error adding video:", videoError);
        toast.error("Error adding video");
        return;
      }

      toast.success("Video added successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Error adding video");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="videoUrl" className="text-sm font-medium">
            Video URL
          </label>
          <Input
            id="videoUrl"
            {...form.register("videoUrl", { required: true })}
            placeholder="Enter video URL (YouTube, Google Drive, etc.)"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Video Title
          </label>
          <Input
            id="title"
            {...form.register("title", { required: true })}
            placeholder="Enter video title"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="channelName" className="text-sm font-medium">
            Channel Name
          </label>
          <Input
            id="channelName"
            {...form.register("channelName", { required: true })}
            placeholder="Enter channel name"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Video
          </Button>
        </div>
      </form>
    </Form>
  );
};
