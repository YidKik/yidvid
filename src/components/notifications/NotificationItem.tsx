
import { useNavigate } from "react-router-dom";

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

  return (
    <div
      key={notification.id}
      className="p-1.5 sm:p-4 hover:bg-[#333333] cursor-pointer transition-colors duration-200 border-b border-[#333333] animate-fade-in"
      onClick={() => {
        navigate(`/video/${notification.video_id}`);
        onNotificationClick();
      }}
    >
      <div className="flex items-start gap-1.5">
        <div className="relative w-12 sm:w-24 h-8 sm:h-16">
          <img
            src={notification.youtube_videos.thumbnail}
            alt={notification.youtube_videos.title}
            className="w-full h-full object-cover rounded"
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
                logoImg.src = "/lovable-uploads/2df6b540-f798-4831-8fcc-255a55486aa0.png";
                logoImg.alt = "YidVid Logo";
                logoImg.className = 'w-6 h-6 sm:w-8 sm:h-8 opacity-70'; // Small centered logo
                
                logoOverlay.appendChild(logoImg);
                parent.appendChild(logoOverlay);
              }
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-sm text-white line-clamp-2 font-medium">
            New video from {notification.youtube_videos.channel_name}
          </p>
          <p className="text-[9px] sm:text-xs text-white/70 mt-0.5 line-clamp-1 sm:line-clamp-2">
            {notification.youtube_videos.title}
          </p>
        </div>
      </div>
    </div>
  );
};
