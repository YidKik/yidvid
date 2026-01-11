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
          className="group bg-white/60 hover:bg-yellow-50/50 rounded-2xl p-4 transition-all duration-200 border border-yellow-100/30 hover:border-yellow-300/50 hover:shadow-sm"
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-9 h-9 bg-gradient-to-br from-yellow-300 to-red-300 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-sm font-bold text-white">
                {getDisplayName(comment.profiles).charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-semibold text-sm text-foreground group-hover:text-yellow-700 transition-colors">
                  {getDisplayName(comment.profiles)}
                </h4>
                <time className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </time>
              </div>
              
              {/* Comment Content */}
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