
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
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
    <div className={`${isMobile ? '' : 'max-w-[1200px] mx-auto'}`}>
      <div className={`grid ${isMobile ? 'grid-cols-3 gap-2' : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2'}`}>
        {shorts.map((short, index) => (
          <div
            key={short.id}
            className="cursor-pointer group opacity-0"
            style={{ animation: `fadeIn 0.6s ease-out ${0.3 + index * 0.05}s forwards`, maxWidth: isMobile ? undefined : '180px' }}
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
            </div>
            <p className={`mt-2 ${isMobile ? 'text-[11px] leading-[1.3]' : 'text-[13px] leading-[1.4]'} font-semibold text-foreground line-clamp-2`}>
              {short.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
