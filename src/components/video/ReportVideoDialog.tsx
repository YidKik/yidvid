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

      const { error } = await supabase.from("video_reports").insert({
        video_id: videoId,
        user_id: userId,
        message,
        email: reportEmail,
      });

      if (error) throw error;

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
      <DialogContent className="sm:max-w-[450px] bg-white dark:bg-gray-900 border-border shadow-2xl rounded-2xl p-0 overflow-hidden [&>button]:hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
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
              <p className="text-white/80 text-sm mt-1">Help us keep our community safe</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Email field for non-logged-in users */}
          {!isAuthenticated && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Your Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border-2 border-muted focus:border-yellow-400 transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                We may contact you for more details about this report
              </p>
            </div>
          )}

          {/* Logged-in user info */}
          {isAuthenticated && user?.email && (
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">Reporting as</p>
                <p className="text-xs text-green-600 dark:text-green-500">{user.email}</p>
              </div>
            </div>
          )}

          {/* Message field */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              What's the issue?
            </Label>
            <Textarea
              id="message"
              placeholder="Please describe what's wrong with this video..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] rounded-xl border-2 border-muted focus:border-yellow-400 transition-colors resize-none"
            />
          </div>

          {/* Info box */}
          <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              Our team reviews all reports within 24-48 hours. We take every report seriously to ensure a safe viewing experience for everyone.
            </p>
          </div>

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
