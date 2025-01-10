import { useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const form = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // First check if the channel already exists
      const { data: existingChannel } = await supabase
        .from("youtube_channels")
        .select("channel_id")
        .eq("channel_id", values.channelId)
        .maybeSingle();

      if (existingChannel) {
        toast({
          title: "Channel already exists",
          description: "This YouTube channel has already been added to your dashboard.",
          variant: "destructive",
        });
        return;
      }

      // If channel doesn't exist, proceed with insertion
      const { error } = await supabase.from("youtube_channels").insert({
        channel_id: values.channelId,
        title: values.title,
        description: values.description,
      });

      if (error) throw error;

      toast({
        title: "Channel added successfully",
        description: "The YouTube channel has been added to your dashboard.",
      });
      onSuccess();
      onClose();
    } catch (error: any) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold mb-4">Add YouTube Channel</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="channelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter YouTube channel ID"
                      {...field}
                      required
                    />
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
                  <FormLabel>Channel Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter channel title"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter channel description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Channel"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};