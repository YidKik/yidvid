import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AddChannelFields } from "@/components/youtube/AddChannelFields";

interface AddChannelFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  channelId: string;
  title: string;
  description?: string;
}

export const AddChannelForm = ({ onClose, onSuccess }: AddChannelFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingChannel, setIsFetchingChannel] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormValues>({
    defaultValues: {
      channelId: "",
      title: "",
      description: "",
    },
  });

  const fetchChannelDetails = async (channelId: string) => {
    if (!channelId.trim()) return;
    
    setIsFetchingChannel(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-youtube-channel', {
        body: { channelId: channelId.trim() },
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY || '',
        }
      });
      
      if (error) {
        console.error("Error fetching channel:", error);
        toast({
          title: "Error fetching channel",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data?.title) {
        form.setValue("title", data.title);
        if (data.description) {
          form.setValue("description", data.description);
        }
      }
    } catch (error: any) {
      console.error("Error fetching channel details:", error);
      toast({
        title: "Error fetching channel details",
        description: "Failed to fetch channel information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingChannel(false);
    }
  };

  // Watch for changes in the channelId field
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "channelId" && value.channelId) {
        fetchChannelDetails(value.channelId);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (values: FormValues) => {
    if (!values.channelId.trim() || !values.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Channel ID and Title are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: existingChannel } = await supabase
        .from("youtube_channels")
        .select("channel_id")
        .eq("channel_id", values.channelId.trim())
        .maybeSingle();

      if (existingChannel) {
        toast({
          title: "Channel already exists",
          description: "This YouTube channel has already been added to your dashboard.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from("youtube_channels").insert({
        channel_id: values.channelId.trim(),
        title: values.title.trim(),
        description: values.description?.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Channel added successfully",
        description: "The YouTube channel has been added to your dashboard.",
      });
      onSuccess();
    } catch (error: any) {
      console.error("Error adding channel:", error);
      toast({
        title: "Error adding channel",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Add YouTube Channel</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AddChannelFields form={form} isLoading={isFetchingChannel} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isFetchingChannel}>
              {isSubmitting ? "Adding..." : "Add Channel"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};