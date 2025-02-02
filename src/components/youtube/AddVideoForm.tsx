import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const formSchema = z.object({
  videoUrl: z.string().url("Please enter a valid URL"),
  title: z.string().min(1, "Title is required"),
  channelName: z.string().min(1, "Channel name is required"),
});

interface AddVideoFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddVideoForm = ({ onClose, onSuccess }: AddVideoFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIsSubmitting(true);

      // Extract video ID from URL (this is a simple example, you might want to add more URL patterns)
      let videoId;
      if (values.videoUrl.includes("youtube.com") || values.videoUrl.includes("youtu.be")) {
        const url = new URL(values.videoUrl);
        videoId = url.searchParams.get("v") || url.pathname.split("/").pop();
      } else {
        // For other platforms, use the full URL as the ID
        videoId = values.videoUrl;
      }

      // Generate a thumbnail URL (for YouTube, you can use their thumbnail API)
      let thumbnail = "";
      if (values.videoUrl.includes("youtube.com") || values.videoUrl.includes("youtu.be")) {
        thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      } else {
        // For other platforms, you might want to add a default thumbnail
        thumbnail = "/placeholder.svg";
      }

      const { error } = await supabase.from("youtube_videos").insert({
        video_id: videoId,
        title: values.title,
        thumbnail,
        channel_name: values.channelName,
        channel_id: values.channelName.toLowerCase().replace(/\s+/g, "-"),
        uploaded_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Video added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding video:", error);
      toast.error("Failed to add video. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Video"}
          </Button>
        </div>
      </form>
    </Form>
  );
};