
import { YoutubeChannelsTable } from "@/integrations/supabase/types/youtube-channels";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { YouTube } from "lucide-react";
import { Channel } from "@/hooks/channel/useChannelsGrid";

interface ChannelListItemProps {
  channel: YoutubeChannelsTable["Row"] | Channel;
  isHidden?: boolean;
  onToggle: (channelId: string) => void;
}

export const ChannelListItem = ({
  channel,
  isHidden = false,
  onToggle,
}: ChannelListItemProps) => {
  return (
    <div className="flex items-center gap-3 p-1 md:p-2 rounded-lg hover:bg-gray-50">
      <div>
        <Checkbox
          checked={!isHidden}
          onCheckedChange={() => onToggle(channel.channel_id)}
          className="mt-1"
        />
      </div>
      <Avatar className="h-6 w-6 md:h-8 md:w-8">
        <AvatarImage 
          src={channel.thumbnail_url || undefined} 
          alt={channel.title} 
        />
        <AvatarFallback>
          <YouTube className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <span className="text-xs md:text-sm font-medium truncate flex-1">
        {channel.title}
      </span>
    </div>
  );
};
