
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
        <img
          src={notification.youtube_videos.thumbnail}
          alt={notification.youtube_videos.title}
          className="w-12 sm:w-24 h-8 sm:h-16 object-cover rounded"
          onError={(e) => {
            console.error("Failed to load thumbnail");
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
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
