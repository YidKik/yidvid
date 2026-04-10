import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Search, MessageSquare, Trash2, Pencil, X, Save, Loader2,
  AlertTriangle, Video, User, Clock, Hash
} from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  video_id: string;
  user_id: string | null;
  profiles: { email: string; username: string | null; display_name: string | null } | null;
  youtube_videos: { title: string; video_id: string } | null;
}

export const CommentsPageV2 = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingComment, setDeletingComment] = useState(false);

  const { data: comments, refetch, isLoading } = useQuery({
    queryKey: ["admin-v2-comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_comments")
        .select(`
          id, content, created_at, video_id, user_id,
          profiles ( email, username, display_name ),
          youtube_videos ( title, video_id )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Comment[];
    },
    retry: 2,
    staleTime: 15000,
  });

  const filtered = useMemo(() => {
    if (!comments) return [];
    if (!searchQuery) return comments;
    const q = searchQuery.toLowerCase();
    return comments.filter(c =>
      c.content?.toLowerCase().includes(q) ||
      c.profiles?.email?.toLowerCase().includes(q) ||
      c.profiles?.username?.toLowerCase().includes(q) ||
      c.profiles?.display_name?.toLowerCase().includes(q) ||
      c.youtube_videos?.title?.toLowerCase().includes(q) ||
      c.id?.toLowerCase().includes(q)
    );
  }, [comments, searchQuery]);

  const selectedComment = useMemo(
    () => filtered.find(c => c.id === selectedCommentId) || null,
    [filtered, selectedCommentId]
  );

  const handleStartEdit = () => {
    if (!selectedComment) return;
    setEditContent(selectedComment.content);
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedComment) return;
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from("video_comments")
        .update({ content: editContent })
        .eq("id", selectedComment.id);
      if (error) throw error;
      toast.success("Comment updated");
      setEditMode(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to update comment");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedComment) return;
    setDeletingComment(true);
    try {
      const { error } = await supabase
        .from("video_comments")
        .delete()
        .eq("id", selectedComment.id);
      if (error) throw error;
      toast.success("Comment deleted");
      setShowDeleteConfirm(false);
      setSelectedCommentId(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete comment");
    } finally {
      setDeletingComment(false);
    }
  };

  const totalComments = comments?.length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-[1600px]">
      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <Card className="bg-[#12131a] border-[#1e2028]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <MessageSquare className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">{totalComments}</p>
              <p className="text-xs text-gray-500">Total Comments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#12131a] border-[#1e2028]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <Search className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">{filtered.length}</p>
              <p className="text-xs text-gray-500">Showing</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search by user, video, content, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-[#12131a] border-[#1e2028] text-gray-200 placeholder:text-gray-500 h-9"
        />
      </div>

      {/* Main content */}
      <div className="flex gap-4">
        {/* Comments list */}
        <Card className={`bg-[#12131a] border-[#1e2028] flex-1 ${selectedComment ? 'max-w-[60%]' : ''}`}>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-22rem)]">
              {filtered.length > 0 ? (
                filtered.map((comment) => {
                  const userName = comment.profiles?.display_name || comment.profiles?.username || comment.profiles?.email || "Anonymous";
                  const videoTitle = comment.youtube_videos?.title || "Unknown Video";
                  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });
                  const isSelected = comment.id === selectedCommentId;

                  return (
                    <div
                      key={comment.id}
                      onClick={() => {
                        setSelectedCommentId(comment.id === selectedCommentId ? null : comment.id);
                        setEditMode(false);
                      }}
                      className={`px-4 py-3 cursor-pointer transition-colors border-b border-[#1e2028] ${
                        isSelected
                          ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500'
                          : 'hover:bg-[#1a1b24]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2a2b35] flex items-center justify-center text-xs font-semibold text-gray-300 shrink-0 mt-0.5">
                          {userName[0]?.toUpperCase() || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium text-gray-200 truncate">{userName}</span>
                            <span className="text-[10px] text-gray-500">{timeAgo}</span>
                          </div>
                          <p className="text-sm text-gray-400 line-clamp-2">{comment.content}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Video className="h-3 w-3 text-gray-600" />
                            <span className="text-[11px] text-gray-600 truncate">{videoTitle}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 py-10 text-center">No comments found</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detail panel */}
        {selectedComment && (
          <Card className="bg-[#12131a] border-[#1e2028] w-[40%] min-w-[320px]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-400" />
                  <h3 className="text-sm font-semibold text-gray-200">Comment Details</h3>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedCommentId(null)}
                  className="text-gray-500 hover:text-gray-300 h-7 w-7 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Separator className="bg-[#1e2028] mb-4" />

              {/* Meta info */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Hash className="h-3 w-3" /> Comment ID</span>
                  <span className="text-xs text-gray-400 font-mono truncate max-w-[180px]">{selectedComment.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><User className="h-3 w-3" /> User</span>
                  <span className="text-sm text-gray-300 truncate max-w-[180px]">
                    {selectedComment.profiles?.display_name || selectedComment.profiles?.username || selectedComment.profiles?.email || "Anonymous"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Video className="h-3 w-3" /> Video</span>
                  <span className="text-sm text-gray-300 truncate max-w-[180px]">{selectedComment.youtube_videos?.title || "Unknown"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Posted</span>
                  <span className="text-sm text-gray-300">
                    {formatDistanceToNow(new Date(selectedComment.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <Separator className="bg-[#1e2028] mb-4" />

              {/* Comment content */}
              {!editMode ? (
                <div className="bg-[#1a1b24] rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{selectedComment.content}</p>
                </div>
              ) : (
                <div className="mb-4">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="bg-[#1a1b24] border-[#2a2b35] text-gray-200 text-sm min-h-[100px]"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                {!editMode ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-[#2a2b35] text-gray-300 hover:text-gray-100 hover:bg-[#1a1b24] justify-start"
                      onClick={handleStartEdit}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Comment
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-start"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Comment
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 text-gray-400 hover:text-gray-200"
                      onClick={() => setEditMode(false)}
                      disabled={savingEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={handleSaveEdit}
                      disabled={savingEdit}
                    >
                      {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-3.5 w-3.5 mr-1" /> Save</>}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-[#12131a] border-[#1e2028] text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-100 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" /> Delete Comment
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This will permanently delete this comment. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="text-gray-400 hover:text-gray-200" disabled={deletingComment}>
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={deletingComment} className="bg-red-600 hover:bg-red-700 text-white">
              {deletingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};