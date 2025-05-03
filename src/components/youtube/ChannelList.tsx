import { Video, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { YoutubeChannelsTable } from "@/integrations/supabase/types/youtube-channels";

interface ChannelListProps {
  channels: YoutubeChannelsTable["Row"][];
  onRemoveChannel: (channelId: string) => void;
  onManageVideos: (channelId: string) => void;
}

export const ChannelList = ({ channels, onRemoveChannel, onManageVideos }: ChannelListProps) => {
  return (
    <ScrollArea className="h-[60vh]">
      <div className="space-y-4 p-4">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              {channel.thumbnail_url && (
                <img
                  src={channel.thumbnail_url}
                  alt={channel.title}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="font-medium text-black">{channel.title}</h3>
                {channel.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {channel.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onManageVideos(channel.channel_id)}
                className="text-muted-foreground hover:text-primary"
              >
                <Video className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveChannel(channel.channel_id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};