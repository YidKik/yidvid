import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export const CommentForm = ({ onSubmit }: CommentFormProps) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isMobile } = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      return;
    }

    if (!comment.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(comment);
      setComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your comment here..."
        className="bg-white/90 border-yellow-200/60 focus:border-yellow-400 focus:ring-yellow-300/30 rounded-xl resize-none min-h-[120px] text-sm leading-relaxed p-4"
      />
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting || !comment.trim()}
          className="rounded-full px-5 py-2 text-sm font-semibold bg-yellow-400 hover:bg-yellow-500 text-yellow-900 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50"
        >
          {isSubmitting ? (
            "Posting..."
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Post Comment
            </>
          )}
        </Button>
      </div>
    </form>
  );
};