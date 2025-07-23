
import { formatDistanceToNow } from "date-fns";
import { VideoCommentsTable } from "@/integrations/supabase/types/video-comments";

type Comment = VideoCommentsTable["Row"] & {
  profiles: {
    email: string;
    name?: string;
    display_name?: string;
  } | null;
};

interface CommentListProps {
  comments?: Comment[];
}

export const CommentList = ({ comments }: CommentListProps) => {
  const getDisplayName = (profile: Comment['profiles']) => {
    if (!profile) return "Anonymous";
    return profile.display_name || profile.name || profile.email || "Anonymous";
  };

  return (
    <div className="space-y-6">
      {comments?.map((comment) => (
        <div key={comment.id} className="bg-card/20 rounded-lg p-4 border border-border/30">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {getDisplayName(comment.profiles).charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="font-semibold text-foreground">
                {getDisplayName(comment.profiles)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pl-10">{comment.content}</p>
        </div>
      ))}
    </div>
  );
};
