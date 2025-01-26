import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RequestChannelFormValues {
  channelName: string;
  channelId?: string;
}

export const RequestChannelDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<RequestChannelFormValues>();

  const onSubmit = async (data: RequestChannelFormValues) => {
    try {
      const { error } = await supabase.from("channel_requests").insert({
        channel_name: data.channelName,
        channel_id: data.channelId || null,
      });

      if (error) throw error;

      toast.success("Channel request submitted successfully!");
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting channel request:", error);
      toast.error("Failed to submit channel request. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 bg-white hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Request Channel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a New Channel</DialogTitle>
          <DialogDescription>
            Submit a request to add a new Jewish content channel to our platform.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="channelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter channel name" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="channelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter YouTube channel ID" {...field} />
                  </FormControl>
                  <FormDescription>
                    You can find the channel ID in the channel's URL or about page.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};