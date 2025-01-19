import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AddChannelForm } from "@/components/AddChannelForm";
import { ChannelSearch } from "@/components/youtube/ChannelSearch";
import { ChannelList } from "@/components/youtube/ChannelList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">YouTube Channels</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="default"
                  size="lg"
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-6 text-lg rounded-md shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <Plus className="h-6 w-6" />
                  Add Channel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add YouTube Channel</DialogTitle>
                </DialogHeader>
                <AddChannelForm
                  onClose={() => setIsDialogOpen(false)}
                  onSuccess={handleSuccess}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="w-full">
            <ChannelSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      </div>
      <ChannelList channels={channels || []} onRemoveChannel={handleRemoveChannel} />
    </div>
  );
};