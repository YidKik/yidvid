
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditCommentDialog } from "./EditCommentDialog";
import { useComments } from "./CommentsContext";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  video_id: string;
  profiles: {
    email: string;
  } | null;
  youtube_videos: {
    title: string;
  } | null;
}

export const CommentsTable = () => {
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const { comments, handleDeleteComment } = useComments();

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Video</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Posted</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments?.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell>{comment.youtube_videos?.title || "Unknown Video"}</TableCell>
              <TableCell>
                {comment.profiles?.email || "Anonymous"}
              </TableCell>
              <TableCell>{comment.content}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingComment(comment)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditCommentDialog
        comment={editingComment}
        onClose={() => setEditingComment(null)}
      />
    </>
  );
};
