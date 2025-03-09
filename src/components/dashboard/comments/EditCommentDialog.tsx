
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useComments } from "./CommentsContext";

interface Comment {
  id: string;
  content: string;
}

interface EditCommentDialogProps {
  comment: Comment | null;
  onClose: () => void;
}

export const EditCommentDialog = ({ comment, onClose }: EditCommentDialogProps) => {
  const [editedContent, setEditedContent] = useState(comment?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refetchComments, refetchNotifications } = useComments();

  const handleEditComment = async () => {
    if (!comment) return;
    if (!editedContent.trim()) {
      toast.error("Comment cannot be empty", { id: "edit-comment-empty" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("video_comments")
        .update({ content: editedContent })
        .eq("id", comment.id);

      if (error) throw error;

      toast.success("Comment updated successfully", { id: "comment-updated" });
      onClose();
      
      await refetchComments();
      await refetchNotifications();
    } catch (error: any) {
      console.error("Error updating comment:", error);
      toast.error("Error updating comment: " + error.message, { id: "comment-update-error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!comment} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Comment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="Edit comment..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleEditComment} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
