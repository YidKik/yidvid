import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  views: number;
  uploadedAt: Date;
  channelId: string;
}

export const VideoCard = ({
  id,
  title,
  thumbnail,
  channelName,
  views,
  uploadedAt,
  channelId,
}: VideoCardProps) => {
  const [channelThumbnail, setChannelThumbnail] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannelThumbnail = async () => {
      try {
        const { data, error } = await supabase
          .from('youtube_channels')
          .select('thumbnail_url')
          .eq('channel_id', channelId)
          .single();

        if (error) {
          console.error('Error fetching channel thumbnail:', error);
          return;
        }

        if (data?.thumbnail_url) {
          setChannelThumbnail(data.thumbnail_url);
        }
      } catch (error) {
        console.error('Error in fetchChannelThumbnail:', error);
      }
    };

    if (channelId) {
      fetchChannelThumbnail();
    }
  }, [channelId]);

  return (
    <div className="group cursor-pointer">
      <Link to={`/video/${id}`} className="block">
        <div className="aspect-video rounded-lg overflow-hidden mb-3 group-hover:animate-gentle-fade">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Link to={`/channel/${channelName}`}>
            <Avatar className="w-10 h-10 rounded-full border-2 border-background shadow-sm">
              {channelThumbnail ? (
                <AvatarImage 
                  src={channelThumbnail} 
                  alt={channelName}
                  className="object-cover"
                  onError={(e) => {
                    console.error("Error loading channel thumbnail:", channelThumbnail);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <AvatarFallback className="bg-primary/10">
                  <Youtube className="w-5 h-5 text-primary" />
                </AvatarFallback>
              )}
            </Avatar>
          </Link>
        </div>
        <div className="flex-1">
          <Link to={`/video/${id}`}>
            <h3 className="text-youtube-title font-medium text-accent line-clamp-2 mb-1">
              {title}
            </h3>
          </Link>
          <Link 
            to={`/channel/${channelName}`}
            className="text-youtube-small font-normal text-secondary hover:text-accent"
          >
            {channelName}
          </Link>
          <div className="text-youtube-small font-normal text-secondary flex items-center gap-1">
            <span>{views.toLocaleString()} views</span>
            <span>•</span>
            <span>{formatDistanceToNow(uploadedAt, { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};