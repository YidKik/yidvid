
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Clock, Eye } from "lucide-react";

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

  return (
    <div className="mt-3 px-1">
      {/* Title - Quicksand friendly font */}
      <h3 
        className="text-sm font-semibold line-clamp-2 text-gray-800 leading-snug"
        style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif" }}
        title={title}
      >
        {title}
      </h3>
      
      {/* Meta info - date and views with icons */}
      <div 
        className="flex items-center gap-3 mt-1.5 text-gray-500"
        style={{ fontFamily: "'Quicksand', sans-serif" }}
      >
        <div className="flex items-center gap-1 text-xs">
          <Clock size={12} className="text-gray-400" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Eye size={12} className="text-gray-400" />
          <span>{formatViewCount(views)}</span>
        </div>
      </div>
      
      {/* Channel name */}
      {!hideChannelName && (
        <div className={`flex items-center ${isMobile ? 'mt-1.5' : 'mt-2'}`}>
          {channelThumbnail && !isMobile && (
            <img 
              src={channelThumbnail} 
              alt={channelName} 
              className="w-5 h-5 rounded-full mr-1.5" 
              onError={(e) => {
                e.currentTarget.src = "/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png";
              }}
            />
          )}
          {channelId ? (
            <Link 
              to={`/channel/${channelId}`}
              className="text-xs text-gray-500 hover:text-blue-500 transition-colors line-clamp-1"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {channelName}
            </Link>
          ) : (
            <span 
              className="text-xs text-gray-500 line-clamp-1"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              {channelName}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
