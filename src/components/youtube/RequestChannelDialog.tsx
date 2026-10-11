import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { toast } from "sonner";
import { Tv, Link, Mail, Send, X } from "lucide-react";
import { useState } from "react";

const loggedInSchema = z.object({
  channelName: z.string().min(1, "Channel name is required").max(100, "Channel name must be less than 100 characters"),
  channelLink: z.string().optional(),
});

const guestSchema = z.object({
  channelName: z.string().min(1, "Channel name is required").max(100, "Channel name must be less than 100 characters"),
  channelLink: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
});

type LoggedInFormValues = z.infer<typeof loggedInSchema>;
type GuestFormValues = z.infer<typeof guestSchema>;

interface RequestChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestChannelDialog = ({ open, onOpenChange }: RequestChannelDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const isLoggedIn = !!session?.user;

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(isLoggedIn ? loggedInSchema : guestSchema),
    defaultValues: {
      channelName: "",
      channelLink: "",
      email: "",
    },
  });

  const onSubmit = async (data: GuestFormValues) => {
    try {
      setIsSubmitting(true);

      const requestData: any = {
        channel_name: data.channelName,
        channel_id: data.channelLink || null,
      };

      if (isLoggedIn && session?.user?.id) {
        requestData.user_id = session.user.id;
      }

      const { data: insertedData, error } = await supabase.from("channel_requests").insert(requestData).select().single();

      if (error) {
        console.error("Error submitting channel request:", error);
        toast.error("Failed to submit request. Please try again.");
        return;
      }

      // Send confirmation email
      const recipientEmail = isLoggedIn && session?.user?.email ? session.user.email : data.email;
      if (recipientEmail) {
        const userName = isLoggedIn && session?.user?.user_metadata?.username 
          ? session.user.user_metadata.username 
          : recipientEmail.split('@')[0];
        supabase.functions.invoke('send-channel-request-email', {
          body: {
            email: recipientEmail,
            name: userName,
            channelName: data.channelName,
          },
        }).catch(err => console.error('Failed to send channel request email:', err));
      }

      toast.success("Channel request submitted successfully!", {
        description: "We'll review your request and add the channel soon.",
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting channel request:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="phone-request-dialog sm:max-w-[480px] w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto bg-background dark:bg-card border border-border shadow-overlay rounded-dialog p-0 [&>button]:hidden">
        <div className="relative flex items-start gap-3 px-6 pt-6 pb-4 border-b border-border">
          <div className="p-2.5 bg-muted rounded-control shrink-0">
            <Tv className="h-5 w-5 text-brand" aria-hidden="true" />
          </div>
          <div className="min-w-0 pr-12">
            <DialogTitle className="type-h3 text-foreground">Request a Channel</DialogTitle>
            <DialogDescription className="type-help text-muted-foreground mt-1">
              Suggest a channel for our collection of Jewish content.
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="absolute right-3 top-3 h-11 w-11 flex items-center justify-center rounded-control text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="channelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Tv className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      Channel Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter the channel name" 
                        className="h-11 rounded-control border border-input bg-background dark:bg-card transition-colors"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="channelLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Link className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      Channel Link
                      <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://youtube.com/@channelname" 
                        className="h-11 rounded-control border border-input bg-background dark:bg-card transition-colors"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isLoggedIn && (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        Your Email
                        <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="your@email.com" 
                          className="h-11 rounded-control border border-input bg-background dark:bg-card transition-colors"
                          {...field} 
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        We'll notify you when the channel is added
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isLoggedIn && (
                <div className="flex items-center gap-3 p-3 bg-muted dark:bg-card rounded-control border border-border">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Submitting as</p>
                    <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </div>
              )}

              {/* Info */}
              <p className="text-xs text-muted-foreground border-t border-border dark:border-border pt-4">
                Our team reviews all requests to ensure they meet our content guidelines. Most requests are processed within 24–48 hours.
              </p>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto sm:min-w-[180px] sm:ml-auto sm:flex h-11 rounded-control bg-primary hover:bg-primary-hover text-primary-foreground type-label transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Submit Request
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
