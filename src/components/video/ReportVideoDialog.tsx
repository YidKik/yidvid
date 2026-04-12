import { useState, useEffect } from "react";
import { Flag, X, AlertTriangle, Send, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

interface ReportVideoDialogProps {
  videoId: string;
  compact?: boolean;
}

export function ReportVideoDialog({ videoId, compact = false }: ReportVideoDialogProps) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { isAuthenticated, user } = useUnifiedAuth();

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setEmail(user.email);
    }
  }, [isAuthenticated, user]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate email for non-logged-in users
      if (!isAuthenticated && !validateEmail(email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      const reportEmail = isAuthenticated && user?.email ? user.email : email;
      const userId = isAuthenticated && user?.id ? user.id : null;

      const { data: insertedReport, error } = await supabase.from("video_reports").insert({
        video_id: videoId,
        user_id: userId,
        message,
        email: reportEmail,
      }).select().single();

      if (error) throw error;

      // Fetch video info for the email
      if (insertedReport) {
        const { data: videoInfo } = await supabase
          .from("youtube_videos")
          .select("title, channel_name")
          .eq("id", videoId)
          .single();

        supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'video-report-acknowledgment',
            recipientEmail: reportEmail,
            idempotencyKey: `video-report-${insertedReport.id}`,
            templateData: {
              name: reportEmail.split('@')[0],
              videoTitle: videoInfo?.title || undefined,
              channelName: videoInfo?.channel_name || undefined,
            },
          },
        }).catch(err => console.error('Failed to send report acknowledgment email:', err));
      }

      toast.success("Thank you! Your report has been submitted successfully.", {
        icon: "✅",
      });
      setIsOpen(false);
      setMessage("");
      if (!isAuthenticated) setEmail("");
    } catch (error) {
      console.error("Error reporting video:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = message.trim().length > 0 && (isAuthenticated || validateEmail(email));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`rounded-full transition-all duration-200 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#666666] hover:text-[#1A1A1A] ${
            compact ? "h-8 px-3" : "h-9 px-4"
          }`}
        >
          <Flag className="h-4 w-4" />
          {!compact && <span className="ml-2 font-medium">Report</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-white border-2 border-[#E5E5E5] shadow-xl rounded-2xl p-0 overflow-hidden [&>button]:hidden">
        {/* Header - solid red */}
        <div className="bg-[#FF0000] px-6 py-5 text-white">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">Report Video</DialogTitle>
              <p className="text-white/90 text-sm mt-0.5">Help us keep our community safe</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Email field for non-logged-in users */}
          {!isAuthenticated && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#666666]" />
                Your Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border-2 border-[#E5E5E5] focus:border-[#FFCC00] transition-colors"
              />
              <p className="text-xs text-[#666666]">
                We may contact you for more details about this report
              </p>
            </div>
          )}

          {/* Logged-in user info */}
          {isAuthenticated && user?.email && (
            <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-xl border border-[#E5E5E5]">
              <div className="p-2 bg-white rounded-full border border-[#E5E5E5]">
                <Mail className="h-4 w-4 text-[#FF0000]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">Reporting as</p>
                <p className="text-xs text-[#666666]">{user.email}</p>
              </div>
            </div>
          )}

          {/* Message field */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#666666]" />
              What's the issue?
            </Label>
            <Textarea
              id="message"
              placeholder="Please describe what's wrong with this video..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] rounded-xl border-2 border-[#E5E5E5] focus:border-[#FFCC00] transition-colors resize-none"
            />
          </div>

          {/* Info box */}
          <div className="flex items-start gap-3 p-3 bg-[#FFCC00] rounded-xl">
            <AlertTriangle className="h-5 w-5 text-[#1A1A1A] flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-[#1A1A1A]">
              Our team reviews all reports carefully. We take every report seriously to ensure a safe viewing experience for everyone.
            </p>
          </div>

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full h-12 rounded-xl bg-[#FF0000] hover:brightness-90 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Submit Report
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
