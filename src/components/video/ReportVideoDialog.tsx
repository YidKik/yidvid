
import { useState } from "react";
import { Flag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReportVideoDialogProps {
  videoId: string;
  compact?: boolean;
}

export function ReportVideoDialog({ videoId, compact = false }: ReportVideoDialogProps) {
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to report a video");
        return;
      }

      const { error } = await supabase.from("video_reports").insert({
        video_id: videoId,
        user_id: session.user.id,
        message,
        email: session.user.email,
      });

      if (error) throw error;

      toast.success("Video reported successfully");
      setIsOpen(false);
      setMessage("");
    } catch (error) {
      console.error("Error reporting video:", error);
      toast.error("Failed to report video. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`group rounded-full hover:bg-muted text-muted-foreground transition-colors ${
            compact ? "h-8 px-2" : "h-9 px-3"
          }`}
        >
          <Flag className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} group-hover:text-destructive transition-colors`} />
          {!compact && <span className="ml-1.5 text-sm group-hover:text-destructive transition-colors">Report</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] relative fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-[#ea384c]"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        <DialogHeader>
          <DialogTitle>Report Video</DialogTitle>
          <DialogDescription>
            Please describe the issue with this video. Your report will be reviewed by our team.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Describe the issue..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!message.trim() || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
