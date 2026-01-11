import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Tv, Link, Mail, Send, X, Sparkles } from "lucide-react";
import { useState } from "react";

// Schema for logged-in users
const loggedInSchema = z.object({
  channelName: z.string().min(1, "Channel name is required").max(100, "Channel name must be less than 100 characters"),
  channelLink: z.string().optional(),
});

// Schema for non-logged-in users
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

      const { error } = await supabase.from("channel_requests").insert(requestData);

      if (error) {
        console.error("Error submitting channel request:", error);
        toast.error("Failed to submit request. Please try again.");
        return;
      }

      toast.success("Channel request submitted successfully!", {
        icon: "🎉",
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
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-gray-900 border-border shadow-2xl rounded-2xl p-0 overflow-hidden [&>button]:hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 p-6 text-white relative">
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Tv className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                Request a Channel
                <Sparkles className="h-5 w-5" />
              </DialogTitle>
              <p className="text-white/90 text-sm mt-1">
                Help us grow our collection of Jewish content
              </p>
            </div>
          </div>
        </div>

        {/* Form content */}
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Channel Name */}
              <FormField
                control={form.control}
                name="channelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Tv className="h-4 w-4 text-yellow-500" />
                      Channel Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter the channel name" 
                        className="h-11 rounded-xl border-2 border-muted focus:border-yellow-400 transition-colors"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Channel Link */}
              <FormField
                control={form.control}
                name="channelLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Link className="h-4 w-4 text-yellow-500" />
                      Channel Link
                      <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://youtube.com/@channelname" 
                        className="h-11 rounded-xl border-2 border-muted focus:border-yellow-400 transition-colors"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email - only for non-logged-in users */}
              {!isLoggedIn && (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-yellow-500" />
                        Your Email
                        <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="your@email.com" 
                          className="h-11 rounded-xl border-2 border-muted focus:border-yellow-400 transition-colors"
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

              {/* Logged in indicator */}
              {isLoggedIn && (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                    <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">Submitting as</p>
                    <p className="text-xs text-green-600 dark:text-green-500">{session?.user?.email}</p>
                  </div>
                </div>
              )}

              {/* Info box */}
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  Our team reviews all channel requests to ensure they meet our content guidelines. Most requests are processed within 24-48 hours.
                </p>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-yellow-200/50 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
