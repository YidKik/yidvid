
import { useNavigate } from "react-router-dom";
import { Play, Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChannelShortsSectionProps {
  shorts: any[];
  isLoading: boolean;
}

export const ChannelShortsSection = ({ shorts, isLoading }: ChannelShortsSectionProps) => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  if (isLoading || shorts.length === 0) return null;

  const formatViews = (views: number) => {
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K`;
    return views.toString();
  };

  return (
    <div className={`grid ${isMobile ? 'grid-cols-3 gap-3' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4'}`}>
      {shorts.map((short, index) => (
        <div
          key={short.id}
          className="cursor-pointer group opacity-0"
          style={{ animation: `fadeIn 0.6s ease-out ${0.3 + index * 0.05}s forwards` }}
          onClick={() => navigate(`/shorts/${short.video_id}`)}
        >
          <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '9/16' }}>
            <img
              src={short.thumbnail}
              alt={short.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
            {short.views > 0 && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1">
                <span className="text-[11px] text-white/90 font-medium">{formatViews(short.views)} views</span>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
          </div>
          <p className={`mt-2.5 ${isMobile ? 'text-[11px] leading-[1.3]' : 'text-[13px] leading-[1.4]'} font-medium text-foreground line-clamp-2`}>
            {short.title}
          </p>
        </div>
      ))}
    </div>
  );
};
