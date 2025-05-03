
import { ChannelAvatar } from "./channel-item/ChannelAvatar";
import { ChannelInfo } from "./channel-item/ChannelInfo";
import { DeleteChannelButton } from "./channel-item/DeleteChannelButton";

interface Channel {
  id: string;
  channel_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
}

interface ChannelListItemProps {
  channel: Channel;
  isDeleting: boolean;
  onSelect: (channelId: string) => void;
  onDelete: (channelId: string) => void;
  setChannelToDelete: (channelId: string | null) => void;
}

export const ChannelListItem = ({
  channel,
  isDeleting,
  onSelect,
  onDelete,
  setChannelToDelete,
}: ChannelListItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50">
      <div 
        className="flex items-center gap-4 cursor-pointer flex-1"
        onClick={() => onSelect(channel.channel_id)}
      >
        <ChannelAvatar
          thumbnailUrl={channel.thumbnail_url}
          title={channel.title}
        />
        <ChannelInfo
          title={channel.title}
          description={channel.description}
        />
      </div>
      <DeleteChannelButton
        isDeleting={isDeleting}
        channelId={channel.channel_id}
        onDelete={onDelete}
        setChannelToDelete={setChannelToDelete}
      />
    </div>
  );
};
