
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Eye, Clock, User } from "lucide-react";

interface VideoCardInfoProps {
  title: string;
  channelName: string;
  channelId?: string;
  views: number;
  formattedDate: string;
  channelThumbnail?: string;
  textColor?: string;
  hideChannelName?: boolean;
}

export const VideoCardInfo = ({
  title,
  channelName,
  channelId,
  views,
  formattedDate,
  channelThumbnail,
  textColor = "text-black",
  hideChannelName = false
}: VideoCardInfoProps) => {
  const { isMobile, isTablet } = useIsMobile();
  
  // Format view count with appropriate suffix (K, M)
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    } else {
      return count.toString();
    }
  };

  const formattedViews = formatViewCount(views);

  return (
    <div className="mt-2">
      {/* Title - Georgia serif for classic feel */}
      <h3 
        className={`text-sm font-medium line-clamp-2 ${textColor}`}
        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        title={title}
      >
        {title}
      </h3>
      
      <div className={`flex items-center ${isMobile ? 'mt-1' : 'mt-1.5'} space-x-1`}>
        {channelThumbnail && !isMobile && (
          <img 
            src={channelThumbnail} 
            alt={channelName} 
            className="w-5 h-5 rounded-full" 
            onError={(e) => {
              e.currentTarget.src = "/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png";
            }}
          />
        )}
        
        <div className="flex flex-col gap-0.5">
          {!hideChannelName && (
            <>
              {channelId ? (
                <Link 
                  to={`/channel/${channelId}`}
                  className={`text-xs hover:text-primary flex items-center gap-1 ${isMobile ? 'font-medium truncate' : 'text-muted-foreground'} line-clamp-1`}
                  style={{ fontFamily: "'Verdana', 'Trebuchet MS', sans-serif" }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <User size={10} className="text-muted-foreground/70 flex-shrink-0" />
                  {channelName}
                </Link>
              ) : (
                <span 
                  className={`text-xs flex items-center gap-1 ${isMobile ? 'font-medium truncate' : 'text-muted-foreground'} line-clamp-1`}
                  style={{ fontFamily: "'Verdana', 'Trebuchet MS', sans-serif" }}
                >
                  <User size={10} className="text-muted-foreground/70 flex-shrink-0" />
                  {channelName}
                </span>
              )}
            </>
          )}
          
          {/* Views and Date - Tahoma for friendly readability */}
          <div 
            className="text-[11px] flex items-center text-muted-foreground"
            style={{ fontFamily: "'Tahoma', 'Arial', sans-serif" }}
          >
            <Eye size={10} className="mr-0.5 text-muted-foreground/60" />
            <span>{formattedViews}</span>
            <span className="mx-1.5">•</span>
            <Clock size={10} className="mr-0.5 text-muted-foreground/60" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
