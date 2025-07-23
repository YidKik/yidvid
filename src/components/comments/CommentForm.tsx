
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export const CommentForm = ({ onSubmit }: CommentFormProps) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <form onSubmit={handleSubmit} className="mb-6">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        className="mb-3 bg-background/50 border-border/60 focus:border-primary/50 rounded-lg"
      />
      <Button 
        type="submit" 
        disabled={isSubmitting}
        variant="default"
        size="sm"
        className="rounded-full px-6 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
      >
        {isSubmitting ? "Posting..." : "Comment"}
      </Button>
    </form>
  );
};
