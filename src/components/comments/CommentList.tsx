import { formatDistanceToNow } from "date-fns";
import { VideoCommentsTable } from "@/integrations/supabase/types/video-comments";
import { useIsMobile } from "@/hooks/use-mobile";

type Comment = VideoCommentsTable["Row"] & {
  profiles: {
    username?: string | null;
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
    return profile.username || profile.display_name || profile.name || "Anonymous";
  };

  const { isMobile } = useIsMobile();

  return (
    <div className={isMobile ? "space-y-2" : "space-y-3"}>
      {comments?.map((comment) => (
        <div 
          key={comment.id} 
          className={`group bg-white/50 hover:bg-surface-hover rounded-card ${isMobile ? 'p-3' : 'p-4'} transition-all duration-200 border border-border`}
        >
          <div className={`flex items-start ${isMobile ? 'gap-2' : 'gap-3'}`}>
            {/* Small Avatar */}
            <div className={`${isMobile ? 'w-5 h-5' : 'w-7 h-7'} bg-brand-soft text-brand rounded-control flex items-center justify-center flex-shrink-0`}>
              <span className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-warning`}>
                {getDisplayName(comment.profiles).charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className={`flex items-center ${isMobile ? 'gap-2 mb-0.5' : 'gap-2 mb-1'}`}>
                <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground font-medium`}>
                  {getDisplayName(comment.profiles)}
                </span>
                <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>•</span>
                <time className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </time>
              </div>
              
              {/* Comment Content */}
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-foreground leading-relaxed whitespace-pre-wrap break-words`}>
                {comment.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
