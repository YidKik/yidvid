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
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import Auth from "@/pages/Auth";

const formSchema = z.object({
  channelName: z.string().min(1, "Channel name is required"),
  channelId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const RequestChannelDialog = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
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

  const handleClick = () => {
    if (!session) {
      setIsAuthOpen(true);
      return;
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (!session?.user?.id) {
        setIsAuthOpen(true);
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
    } catch (error) {
      console.error("Error submitting channel request:", error);
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            data-trigger="request-channel-dialog"
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 h-7 md:h-9 text-xs md:text-sm px-2.5 md:px-3.5 rounded-full shadow-sm border border-gray-200"
            onClick={handleClick}
          >
            <Plus className="h-3 w-3 md:h-4 md:w-4" />
            Request Channel
          </Button>
        </DialogTrigger>
        {session && (
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
        )}
      </Dialog>
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
};
