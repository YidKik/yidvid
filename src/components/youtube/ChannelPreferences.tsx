import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Youtube } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChannelSearch } from "@/components/youtube/ChannelSearch";

export const ChannelPreferences = () => {
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Load hidden channels from database
  const loadHiddenChannels = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: hiddenChannelsData, error } = await supabase
      .from('hidden_channels')
      .select('channel_id')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error loading hidden channels:', error);
      return;
    }

    setHiddenChannels(new Set(hiddenChannelsData.map(hc => hc.channel_id)));
  };

  useEffect(() => {
    loadHiddenChannels();
  }, []);

  // Fetch all channels
  const { data: channels, isLoading } = useQuery({
    queryKey: ["youtube-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .order("title", { ascending: true });

      if (error) {
        console.error("Error fetching channels:", error);
        toast.error("Failed to load channels");
        return [];
      }

      return data || [];
    },
  });

  const toggleChannel = async (channelId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in to manage channel preferences");
      return;
    }

    const newHiddenChannels = new Set(hiddenChannels);
    const isCurrentlyHidden = newHiddenChannels.has(channelId);

    try {
      if (isCurrentlyHidden) {
        // Unhide channel
        const { error } = await supabase
          .from('hidden_channels')
          .delete()
          .eq('user_id', session.user.id)
          .eq('channel_id', channelId);

        if (error) throw error;
        newHiddenChannels.delete(channelId);
      } else {
        // Hide channel
        const { error } = await supabase
          .from('hidden_channels')
          .insert({
            user_id: session.user.id,
            channel_id: channelId
          });

        if (error) throw error;
        newHiddenChannels.add(channelId);
      }

      setHiddenChannels(newHiddenChannels);
      toast.success(
        `Channel ${isCurrentlyHidden ? "unhidden" : "hidden"} successfully`
      );
    } catch (error) {
      console.error('Error toggling channel visibility:', error);
      toast.error("Failed to update channel visibility");
    }
  };

  // Filter channels based on search query
  const filteredChannels = channels?.filter(channel =>
    channel.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading channels...</div>;
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <ChannelSearch value={searchQuery} onChange={setSearchQuery} />
      </div>
      <div className="max-h-[400px] overflow-y-auto scrollbar-hide space-y-6">
        {filteredChannels?.map((channel) => (
          <div
            key={channel.channel_id}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              hiddenChannels.has(channel.channel_id)
                ? "bg-muted/50 line-through"
                : "bg-card"
            }`}
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={channel.thumbnail_url}
                  alt={channel.title}
                />
                <AvatarFallback>
                  <Youtube className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{channel.title}</p>
                <p className="text-sm text-muted-foreground">
                  {channel.description || "No description"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`channel-${channel.channel_id}`}
                checked={!hiddenChannels.has(channel.channel_id)}
                onCheckedChange={() => toggleChannel(channel.channel_id)}
              />
              <Label htmlFor={`channel-${channel.channel_id}`}>
                {hiddenChannels.has(channel.channel_id) ? "Hidden" : "Visible"}
              </Label>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};