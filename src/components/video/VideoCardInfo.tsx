
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

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
      <h3 
        className={`video-title text-sm font-medium line-clamp-2 ${textColor}`}
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
        
        <div className="flex flex-col">
          {!hideChannelName && (
            <>
              {channelId ? (
                <Link 
                  to={`/channel/${channelId}`}
                  className={`video-channel-name text-xs hover:text-black ${isMobile ? 'font-medium' : 'text-gray-500'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {channelName}
                </Link>
              ) : (
                <span className={`video-channel-name text-xs ${isMobile ? 'font-medium' : 'text-gray-500'}`}>
                  {channelName}
                </span>
              )}
            </>
          )}
          
          <div className="video-meta-text text-xs flex items-center">
            <span className={`${isMobile ? 'text-gray-600' : 'text-gray-500'}`}>{formattedViews} views</span>
            <span className={`mx-1 ${isMobile ? 'text-gray-600' : 'text-gray-500'}`}>•</span>
            <span className={`${isMobile ? 'text-gray-600' : 'text-gray-500'}`}>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
