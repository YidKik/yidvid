
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Youtube } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChannelListItemProps {
  channel: {
    channel_id: string;
    title: string;
    description: string | null;
    thumbnail_url: string;
  };
  isHidden: boolean;
  onToggle: (channelId: string) => void;
}

export const ChannelListItem = ({ channel, isHidden, onToggle }: ChannelListItemProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex items-center justify-between p-1.5 md:p-3 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-1.5 md:gap-3 min-w-0">
        <Avatar className="h-6 w-6 md:h-10 md:w-10 border border-gray-100 flex-shrink-0">
          <AvatarImage
            src={channel.thumbnail_url}
            alt={channel.title}
          />
          <AvatarFallback>
            <Youtube className="h-2.5 w-2.5 md:h-4 md:w-4 text-gray-400" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 text-xs md:text-base truncate max-w-[140px] md:max-w-full">
            {channel.title}
          </p>
          {!isMobile ? (
            <p className="text-xs md:text-sm text-gray-500 truncate max-w-[140px] md:max-w-[200px]">
              {channel.description || "No description"}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        <Switch
          id={`channel-${channel.channel_id}`}
          checked={!isHidden}
          onCheckedChange={() => onToggle(channel.channel_id)}
          className="data-[state=checked]:bg-green-600 h-3 w-6 md:h-5 md:w-10"
        />
        <Label 
          htmlFor={`channel-${channel.channel_id}`}
          className={`text-[9px] md:text-sm font-medium ${
            isHidden ? 'text-red-600' : 'text-green-600'
          } hidden xs:inline-block`}
        >
          {isHidden ? "Not Allowed" : "Allowed"}
        </Label>
      </div>
    </div>
  );
};
