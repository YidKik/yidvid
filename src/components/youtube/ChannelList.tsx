import { Trash2, Youtube, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChannelVideosManagement } from "./ChannelVideosManagement";

interface Channel {
  id: string;
  title: string;
  channel_id: string;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

interface ChannelListProps {
  channels: Channel[];
  onRemoveChannel: (channelId: string) => void;
}

export const ChannelList = ({ channels, onRemoveChannel }: ChannelListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Channel</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Added On</TableHead>
          <TableHead className="w-[150px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {channels?.map((channel) => (
          <TableRow key={channel.id}>
            <TableCell className="flex items-center gap-2">
              {channel.thumbnail_url ? (
                <img
                  src={channel.thumbnail_url}
                  alt={channel.title}
                  className="w-8 h-8 rounded"
                />
              ) : (
                <Youtube className="w-8 h-8 text-primary" />
              )}
              <div>
                <p className="font-medium">{channel.title}</p>
                <p className="text-sm text-muted-foreground">
                  {channel.channel_id}
                </p>
              </div>
            </TableCell>
            <TableCell>{channel.description || "No description"}</TableCell>
            <TableCell>
              {new Date(channel.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary hover:text-primary hover:bg-primary/10"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <ChannelVideosManagement channelId={channel.channel_id} />
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveChannel(channel.channel_id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};