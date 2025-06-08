
import { Play, Users } from 'lucide-react';

interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  channel_name: string;
}

interface ChannelResult {
  id: string;
  title: string;
  thumbnail_url?: string;
  channel_id: string;
}

interface SearchResultItemProps {
  type: 'video' | 'channel';
  item: VideoResult | ChannelResult;
  onClick: () => void;
  isMobile: boolean;
}

export const SearchResultItem = ({ type, item, onClick, isMobile }: SearchResultItemProps) => {
  if (type === 'video') {
    const video = item as VideoResult;
    return (
      <button
        onClick={onClick}
        className={`
          w-full flex items-center space-x-3 hover:bg-red-50 transition-colors
          border-b border-red-100 last:border-b-0
          ${isMobile ? 'p-3' : 'p-4'}
        `}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className={`
            object-cover rounded-lg flex-shrink-0
            ${isMobile ? 'w-16 h-12' : 'w-20 h-14'}
          `}
          onError={(e) => {
            console.error('Failed to load thumbnail:', video.thumbnail);
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="flex-1 text-left overflow-hidden">
          <h4 className={`
            font-medium text-gray-800 line-clamp-2
            ${isMobile ? 'text-sm' : 'text-base'}
          `}>
            {video.title}
          </h4>
          <p className={`
            text-gray-500 truncate
            ${isMobile ? 'text-xs' : 'text-sm'}
          `}>
            {video.channel_name}
          </p>
        </div>
      </button>
    );
  }

  const channel = item as ChannelResult;
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center space-x-3 hover:bg-red-50 transition-colors
        border-b border-red-100 last:border-b-0
        ${isMobile ? 'p-3' : 'p-4'}
      `}
    >
      <div className={`
        rounded-full bg-red-100 flex items-center justify-center flex-shrink-0
        ${isMobile ? 'w-12 h-12' : 'w-14 h-14'}
      `}>
        {channel.thumbnail_url ? (
          <img
            src={channel.thumbnail_url}
            alt={channel.title}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              console.error('Failed to load channel thumbnail:', channel.thumbnail_url);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <Users className={`text-red-500 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
        )}
      </div>
      <div className="flex-1 text-left overflow-hidden">
        <h4 className={`
          font-medium text-gray-800 truncate
          ${isMobile ? 'text-sm' : 'text-base'}
        `}>
          {channel.title}
        </h4>
        <p className={`
          text-gray-500
          ${isMobile ? 'text-xs' : 'text-sm'}
        `}>
          Channel
        </p>
      </div>
    </button>
  );
};
