import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  videoUrl: z.string().min(1, "Video URL is required"),
  title: z.string().min(1, "Title is required"),
  channelName: z.string().min(1, "Channel name is required"),
});

interface AddVideoFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddVideoForm = ({ onClose, onSuccess }: AddVideoFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoUrl: "",
      title: "",
      channelName: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      console.log("Adding video with values:", values);

      // Extract video ID from URL (assuming YouTube URL)
      const videoId = values.videoUrl.split("v=")[1]?.split("&")[0] || values.videoUrl;
      
      // First, create or get the channel
      const channelId = values.channelName.toLowerCase().replace(/\s+/g, '-');
      
      // Check if channel exists
      const { data: existingChannel } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("channel_id", channelId)
        .single();

      if (!existingChannel) {
        // Create the channel if it doesn't exist
        const { error: channelError } = await supabase
          .from("youtube_channels")
          .insert({
            channel_id: channelId,
            title: values.channelName,
            description: `Channel for ${values.channelName}`,
          });

        if (channelError) {
          console.error("Error creating channel:", channelError);
          throw channelError;
        }
      }

      // Now add the video
      const { error: videoError } = await supabase
        .from("youtube_videos")
        .insert({
          video_id: videoId,
          title: values.title,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          channel_id: channelId,
          channel_name: values.channelName,
          uploaded_at: new Date().toISOString(),
        });

      if (videoError) {
        console.error("Error adding video:", videoError);
        throw videoError;
      }

      toast.success("Video added successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error adding video:", error);
      toast.error(error.message || "Error adding video");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input placeholder="Enter video URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter video title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="channelName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Channel Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter channel name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Video"}
          </Button>
        </div>
      </form>
    </Form>
  );
};