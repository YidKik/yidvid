
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
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
  const { refetchComments, refetchNotifications } = useComments();

  const handleEditComment = async () => {
    if (!comment) return;

    try {
      const { error } = await supabase
        .from("video_comments")
        .update({ content: editedContent })
        .eq("id", comment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
      onClose();
      
      await refetchComments();
      await refetchNotifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error updating comment: " + error.message,
        variant: "destructive",
      });
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
          <Button variant="outline" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button onClick={handleEditComment}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
