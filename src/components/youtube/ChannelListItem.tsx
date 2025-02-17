
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Youtube } from "lucide-react";

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
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10 border border-gray-100">
          <AvatarImage
            src={channel.thumbnail_url}
            alt={channel.title}
          />
          <AvatarFallback>
            <Youtube className="h-5 w-5 text-gray-400" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-gray-900">{channel.title}</p>
          <p className="text-sm text-gray-500 line-clamp-1">
            {channel.description || "No description"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id={`channel-${channel.channel_id}`}
          checked={!isHidden}
          onCheckedChange={() => onToggle(channel.channel_id)}
          className="data-[state=checked]:bg-green-600"
        />
        <Label 
          htmlFor={`channel-${channel.channel_id}`}
          className={`text-sm font-medium ${
            isHidden ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {isHidden ? "Not Allowed" : "Allowed"}
        </Label>
      </div>
    </div>
  );
};
