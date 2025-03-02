
import { Link } from "react-router-dom";
import { Youtube } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ChannelCardProps {
  id: string;
  channel_id: string;
  title: string;
  thumbnail_url: string | null;
  index: number;
}

export const ChannelCard = ({ id, channel_id, title, thumbnail_url, index }: ChannelCardProps) => {
  return (
    <div 
      className="opacity-0 animate-fadeIn group flex flex-col items-center p-2 md:p-6 rounded-lg bg-[#F5F5F5] hover:bg-[#E8E8E8] transition-all duration-300"
      style={{ 
        animationDelay: `${index * 0.1}s`,
        animationFillMode: 'forwards'
      }}
    >
      <Link 
        to={`/channel/${channel_id}`}
        className="block mb-2 md:mb-4"
      >
        <Avatar className="w-12 h-12 md:w-24 md:h-24 transition-transform duration-300 group-hover:scale-110 cursor-pointer">
          {thumbnail_url ? (
            <AvatarImage
              src={thumbnail_url}
              alt={title}
              className="object-cover"
              onError={(e) => {
                // If image fails to load, show fallback
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.querySelector('.fallback')?.classList.remove('hidden');
              }}
            />
          ) : (
            <AvatarFallback className="bg-primary/10">
              <Youtube className="w-6 h-6 md:w-12 md:h-12 text-primary" />
            </AvatarFallback>
          )}
          <div className="fallback hidden">
            <AvatarFallback className="bg-primary/10">
              <Youtube className="w-6 h-6 md:w-12 md:h-12 text-primary" />
            </AvatarFallback>
          </div>
        </Avatar>
      </Link>
      <Link 
        to={`/channel/${channel_id}`}
        className="text-[10px] md:text-sm font-medium text-center line-clamp-2 group-hover:text-[#ea384c] transition-colors duration-300"
      >
        {title || "Untitled Channel"}
      </Link>
    </div>
  );
};
