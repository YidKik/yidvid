import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Edit, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  video_id: string;
  profiles: {
    email: string;
    name: string | null;
  } | null;
  youtube_videos: {
    title: string;
  } | null;
}

interface AdminNotification {
  id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const CommentsManagementSection = () => {
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editedContent, setEditedContent] = useState("");

  const { data: notifications } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .eq("type", "new_comment")
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching notifications",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data as AdminNotification[];
    },
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["all-comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_comments")
        .select(`
          *,
          profiles (
            email,
            name
          ),
          youtube_videos (
            title
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching comments",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data as Comment[];
    },
  });

  // Set up real-time subscription for comments
  useEffect(() => {
    const channel = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_comments'
        },
        () => {
          refetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchComments]);

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("video_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error deleting comment: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditComment = async () => {
    if (!editingComment) return;

    try {
      const { error } = await supabase
        .from("video_comments")
        .update({ content: editedContent })
        .eq("id", editingComment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
      setEditingComment(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error updating comment: " + error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Comments Management</h2>
          {notifications && notifications.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {notifications.length} new
            </Badge>
          )}
        </div>
      </div>
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
                {comment.profiles?.name || comment.profiles?.email || "Anonymous"}
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
                    onClick={() => {
                      setEditingComment(comment);
                      setEditedContent(comment.content);
                    }}
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

      <Dialog open={!!editingComment} onOpenChange={() => setEditingComment(null)}>
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
            <Button variant="outline" onClick={() => setEditingComment(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditComment}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};