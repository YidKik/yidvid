
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface NotificationItemProps {
  notification: {
    id: string;
    video_id: string;
    youtube_videos: {
      title: string;
      thumbnail: string;
      channel_name: string;
    };
  };
  onNotificationClick: () => void;
}

export const NotificationItem = ({ notification, onNotificationClick }: NotificationItemProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div
      key={notification.id}
      className={`
        p-4 sm:p-5 hover:bg-[#333333] cursor-pointer transition-colors duration-200 
        border-b border-[#333333] animate-fade-in
        ${isMobile ? 'active:bg-[#444444]' : ''}
      `}
      onClick={() => {
        navigate(`/video/${notification.video_id}`);
        onNotificationClick();
      }}
    >
      <div className="flex items-start gap-3">
        <div className="relative w-18 sm:w-24 h-12 sm:h-16 flex-shrink-0">
          <img
            src={notification.youtube_videos.thumbnail}
            alt={notification.youtube_videos.title}
            className="w-full h-full object-cover rounded-md"
            onError={(e) => {
              console.error("Failed to load thumbnail");
              e.currentTarget.src = "/placeholder.svg";
              
              // Add centered logo
              const imgElement = e.currentTarget;
              const parent = imgElement.parentElement;
              
              if (parent) {
                // Create logo overlay
                const logoOverlay = document.createElement('div');
                logoOverlay.className = 'absolute inset-0 flex items-center justify-center';
                
                const logoImg = document.createElement('img');
                logoImg.src = "/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png";
                logoImg.alt = "YidVid Logo";
                logoImg.className = 'w-6 h-6 sm:w-8 sm:h-8 opacity-70'; // Small centered logo
                
                logoOverlay.appendChild(logoImg);
                parent.appendChild(logoOverlay);
              }
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base text-white line-clamp-2 font-medium">
            New video from {notification.youtube_videos.channel_name}
          </p>
          <p className="text-xs sm:text-sm text-white/70 mt-1 line-clamp-2">
            {notification.youtube_videos.title}
          </p>
        </div>
      </div>
    </div>
  );
};
