import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VideoGridHeaderProps {
  isLoading: boolean;
  hasChannels: boolean;
  hasVideos: boolean;
  onChannelSelect: (channelId: string | null) => void;
  selectedChannelId: string | null;
  channels: Array<{ channel_id: string; title: string }>;
}

export const VideoGridHeader = ({
  isLoading,
  hasChannels,
  hasVideos,
  onChannelSelect,
  selectedChannelId,
  channels
}: VideoGridHeaderProps) => {
  if (isLoading) {
    return <div className="h-8 animate-pulse bg-muted rounded w-64" />;
  }

  if (!hasChannels) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to Your Video Dashboard</h2>
        <p className="text-muted-foreground mb-8">
          Get started by adding your favorite YouTube channels
        </p>
        <Link to="/dashboard">
          <Button size="lg">Add Channels</Button>
        </Link>
      </div>
    );
  }

  if (!hasVideos) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4">
      <Select
        value={selectedChannelId || "all"}
        onValueChange={(value) => onChannelSelect(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a channel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Channels</SelectItem>
          {channels.map((channel) => (
            <SelectItem key={channel.channel_id} value={channel.channel_id}>
              {channel.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};