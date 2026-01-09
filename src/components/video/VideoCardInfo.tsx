
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { User } from "lucide-react";

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

  return (
    <div className="mt-2">
      {/* Title - Bold, friendly, strong font */}
      <h3 
        className="text-sm font-bold line-clamp-2 text-gray-900"
        style={{ fontFamily: "'Arial Black', 'Helvetica Bold', sans-serif", letterSpacing: '-0.01em' }}
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
                  className="text-xs flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors line-clamp-1"
                  style={{ fontFamily: "'Verdana', 'Trebuchet MS', sans-serif" }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <User size={10} className="text-gray-500 flex-shrink-0" />
                  {channelName}
                </Link>
              ) : (
                <span 
                  className="text-xs flex items-center gap-1 text-gray-600 line-clamp-1"
                  style={{ fontFamily: "'Verdana', 'Trebuchet MS', sans-serif" }}
                >
                  <User size={10} className="text-gray-500 flex-shrink-0" />
                  {channelName}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
