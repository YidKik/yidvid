
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
    <div className="space-y-4">
      {comments?.map((comment) => (
        <div key={comment.id} className="group hover:bg-accent/20 rounded-lg p-4 transition-all duration-200 border-l-2 border-l-primary/20 hover:border-l-primary/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-background shadow-sm">
              <span className="text-sm font-bold text-primary">
                {getDisplayName(comment.profiles).charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {getDisplayName(comment.profiles)}
                </h4>
                <time className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </time>
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
