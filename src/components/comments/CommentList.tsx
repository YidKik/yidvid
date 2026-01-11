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
    <div className="space-y-3">
      {comments?.map((comment) => (
        <div 
          key={comment.id} 
          className="group bg-white/50 hover:bg-yellow-50/40 rounded-xl p-3.5 transition-all duration-200 border border-yellow-100/20 hover:border-yellow-200/40"
        >
          <div className="flex items-start gap-2.5">
            {/* Small Avatar */}
            <div className="w-7 h-7 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-yellow-800">
                {getDisplayName(comment.profiles).charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Header - name smaller and less prominent */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground/70 font-medium">
                  {getDisplayName(comment.profiles)}
                </span>
                <span className="text-[10px] text-muted-foreground/50">•</span>
                <time className="text-[10px] text-muted-foreground/50">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </time>
              </div>
              
              {/* Comment Content - more prominent */}
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};