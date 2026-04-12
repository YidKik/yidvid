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
      if (recipientEmail && insertedData) {
        supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'channel-request-confirmation',
            recipientEmail,
            idempotencyKey: `channel-request-${insertedData.id}`,
            templateData: { name: recipientEmail.split('@')[0], channelName: data.channelName },
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
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#333] shadow-xl rounded-2xl p-0 overflow-hidden [&>button]:hidden">
        {/* Header — solid color, no gradient */}
        <div className="bg-[#FFCC00] p-5 relative">
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1A1A1A]/10 rounded-lg">
              <Tv className="h-5 w-5 text-[#1A1A1A]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[#1A1A1A]">
                Request a Channel
              </DialogTitle>
              <p className="text-[#1A1A1A]/70 text-sm mt-0.5">
                Help us grow our collection of Jewish content
              </p>
            </div>
          </div>
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
                      <Tv className="h-4 w-4 text-[#FFCC00]" />
                      Channel Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter the channel name" 
                        className="h-11 rounded-lg border border-[#E5E5E5] dark:border-[#444] focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition-colors bg-white dark:bg-[#222]"
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
                      <Link className="h-4 w-4 text-[#FFCC00]" />
                      Channel Link
                      <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://youtube.com/@channelname" 
                        className="h-11 rounded-lg border border-[#E5E5E5] dark:border-[#444] focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition-colors bg-white dark:bg-[#222]"
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
                        <Mail className="h-4 w-4 text-[#FFCC00]" />
                        Your Email
                        <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="your@email.com" 
                          className="h-11 rounded-lg border border-[#E5E5E5] dark:border-[#444] focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition-colors bg-white dark:bg-[#222]"
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
                <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] dark:bg-[#222] rounded-lg border border-[#E5E5E5] dark:border-[#444]">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Submitting as</p>
                    <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </div>
              )}

              {/* Info */}
              <p className="text-xs text-muted-foreground border-t border-[#E5E5E5] dark:border-[#333] pt-4">
                Our team reviews all requests to ensure they meet our content guidelines. Most requests are processed within 24–48 hours.
              </p>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-lg bg-[#FFCC00] hover:bg-[#E6B800] text-[#1A1A1A] font-semibold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-[#1A1A1A]/30 border-t-[#1A1A1A] rounded-full animate-spin" />
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
