import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export const CommentForm = ({ onSubmit }: CommentFormProps) => {
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(comment);
    setComment("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
        className="mb-2"
      />
      <Button type="submit">Post Comment</Button>
    </form>
  );
};