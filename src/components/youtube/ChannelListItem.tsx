
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Youtube } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Channel } from "@/hooks/channel/useChannelsGrid";
import { YoutubeChannelsTable } from "@/integrations/supabase/types/youtube-channels";

interface ChannelListItemProps {
  channel: Channel | YoutubeChannelsTable["Row"];
  isHidden: boolean;
  onToggle: (channelId: string) => void;
}

export const ChannelListItem = ({ channel, isHidden, onToggle }: ChannelListItemProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex items-center justify-between p-3 md:p-4 rounded-2xl border border-red-200 bg-gradient-to-r from-white to-red-50/30 hover:bg-red-50/50 transition-all duration-300 hover:shadow-md hover:border-red-300">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-8 w-8 md:h-12 md:w-12 border-2 border-red-200 flex-shrink-0 shadow-sm">
          <AvatarImage
            src={channel.thumbnail_url || ''}
            alt={channel.title}
            className="object-cover"
          />
          <AvatarFallback className="bg-red-100">
            <Youtube className="h-3 w-3 md:h-5 md:w-5 text-red-500" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 text-sm md:text-base truncate">
            {channel.title}
          </p>
          {!isMobile && (
            <p className="text-xs md:text-sm text-muted-foreground truncate max-w-[300px]">
              {'description' in channel ? (channel.description || "No description available") : "No description available"}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <Switch
          id={`channel-${channel.channel_id}`}
          checked={!isHidden}
          onCheckedChange={() => onToggle(channel.channel_id)}
          className="h-5 w-9 md:h-6 md:w-11"
        />
        <div className="hidden sm:flex flex-col items-end">
          <span className={`text-xs md:text-sm font-semibold ${
            isHidden ? 'text-red-400' : 'text-red-600'
          }`}>
            {isHidden ? "Hidden" : "Visible"}
          </span>
          <span className="text-xs text-muted-foreground">
            {isHidden ? "Not shown" : "In feed"}
          </span>
        </div>
      </div>
    </div>
  );
};
