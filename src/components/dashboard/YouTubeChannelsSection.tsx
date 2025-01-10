import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AddChannelForm } from "@/components/AddChannelForm";
import { ChannelSearch } from "@/components/youtube/ChannelSearch";
import { ChannelList } from "@/components/youtube/ChannelList";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export const YouTubeChannelsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: channels, refetch } = useQuery({
    queryKey: ["youtube-channels", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("youtube_channels")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery.trim()) {
        query = query.ilike("title", `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching channels:", error);
        toast({
          title: "Error fetching channels",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    },
  });

  const handleRemoveChannel = async (channelId: string) => {
    try {
      const { error: videosError } = await supabase
        .from("youtube_videos")
        .delete()
        .eq("channel_id", channelId);

      if (videosError) throw videosError;

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

  const handleSuccess = async () => {
    await refetch();
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Channel added successfully",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">YouTube Channels</h2>
        <div className="flex items-center gap-4">
          <ChannelSearch value={searchQuery} onChange={setSearchQuery} />
          
          {/* First Add Channel Button */}
          <Dialog modal open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <AddChannelForm
                onClose={() => setIsDialogOpen(false)}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
          
          {/* Second Add Channel Button - Alternative Style */}
          <Dialog modal open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setIsDialogOpen(true)}
                variant="secondary"
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Channel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <AddChannelForm
                onClose={() => setIsDialogOpen(false)}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <ChannelList channels={channels || []} onRemoveChannel={handleRemoveChannel} />
    </div>
  );
};