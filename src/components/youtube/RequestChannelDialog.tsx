
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  channelName: z.string().min(1, "Channel name is required"),
  channelId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RequestChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestChannelDialog = ({ open, onOpenChange }: RequestChannelDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channelName: "",
      channelId: "",
    },
  });

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (!session?.user?.id) {
        console.error("User not authenticated, cannot request channel.");
        onOpenChange(false);
        return;
      }

      const { error } = await supabase.from("channel_requests").insert({
        channel_name: data.channelName,
        channel_id: data.channelId || null,
        user_id: session.user.id,
      });

      if (error) {
        console.error("Error submitting channel request:", error);
        throw error;
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting channel request:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <Input placeholder="Enter channel name" {...field} />
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
              <Button type="submit" className="h-8 md:h-10 text-sm md:text-base">Submit Request</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
