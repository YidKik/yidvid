import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Youtube, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddChannelForm } from "@/components/AddChannelForm";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const { data: channels, refetch } = useQuery({
    queryKey: ["youtube-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching channels",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  const handleRemoveChannel = async (channelId: string) => {
    try {
      // First, delete all videos associated with this channel
      const { error: videosError } = await supabase
        .from("youtube_videos")
        .delete()
        .eq("channel_id", channelId);

      if (videosError) throw videosError;

      // Then delete the channel
      const { error: channelError } = await supabase
        .from("youtube_channels")
        .delete()
        .eq("channel_id", channelId);

      if (channelError) throw channelError;

      toast({
        title: "Channel removed",
        description: "The channel and its videos have been removed from your dashboard.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error removing channel",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">YouTube Channels Dashboard</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2" />
          Add Channel
        </Button>
      </div>

      {showAddForm && (
        <AddChannelForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            refetch();
          }}
        />
      )}

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Added On</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
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
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveChannel(channel.channel_id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Dashboard;