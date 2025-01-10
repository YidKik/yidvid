import { formatDistanceToNow } from "date-fns";
import { Database } from "@/integrations/supabase/types";

type Comment = Database["public"]["Tables"]["video_comments"]["Row"] & {
  profiles?: {
    email?: string;
  } | null;
};

interface CommentListProps {
  comments?: Comment[];
}

export const CommentList = ({ comments }: CommentListProps) => {
  return (
    <div className="space-y-4">
      {comments?.map((comment) => (
        <div key={comment.id} className="border-b pb-4">
          <div className="flex justify-between items-start mb-2">
            <p className="font-medium">
              {comment.profiles?.email || "Anonymous"}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </p>
          </div>
          <p>{comment.content}</p>
        </div>
      ))}
    </div>
  );
};