import { useState } from "react";
import { Trash2, Youtube, Video, Edit2 } from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const { toast } = useToast();

  const handleRenameChannel = async () => {
    if (!selectedChannel || !newTitle.trim()) return;

    try {
      const { error } = await supabase
        .from("youtube_channels")
        .update({ title: newTitle.trim() })
        .eq("channel_id", selectedChannel.channel_id);

      if (error) throw error;

      toast({
        title: "Channel renamed",
        description: "The channel has been renamed successfully.",
      });

      // Close dialog and reset state
      setIsRenameDialogOpen(false);
      setSelectedChannel(null);
      setNewTitle("");

      // Trigger a refetch of the channels
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error renaming channel",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openRenameDialog = (channel: Channel) => {
    setSelectedChannel(channel);
    setNewTitle(channel.title);
    setIsRenameDialogOpen(true);
  };

  return (
    <>
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
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                    <ChannelVideosManagement channelId={channel.channel_id} />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openRenameDialog(channel)}
                  className="text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
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

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">New Channel Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter new channel title"
              />
            </div>
            <Button onClick={handleRenameChannel} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};