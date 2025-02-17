
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Youtube, Shield, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChannelSearch } from "@/components/youtube/ChannelSearch";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
        `Channel ${isCurrentlyHidden ? "added to" : "removed from"} your allowed list`
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
    <Card className="p-6 bg-[#F2FCE2]">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Content Control Settings</h3>
            <p className="text-sm text-gray-600 mt-1">
              Customize your viewing experience by selecting which channels you want to include in your feed. 
              This helps create a safe and personalized environment for you and your family.
            </p>
          </div>
        </div>

        <Alert className="bg-[#D3E4FD] border-blue-200">
          <AlertDescription className="text-gray-700">
            Use the toggles below to manage your channel preferences. When a channel is marked as "Allowed", 
            its content will appear in your feed. Channels marked as "Not Allowed" won't show up in your recommendations or search results.
          </AlertDescription>
        </Alert>

        <div className="mb-6">
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
            <Search className="h-4 w-4 text-gray-500" />
            <ChannelSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto scrollbar-hide space-y-3">
          {filteredChannels?.map((channel) => (
            <div
              key={channel.channel_id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 transition-colors"
            >
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
                  checked={!hiddenChannels.has(channel.channel_id)}
                  onCheckedChange={() => toggleChannel(channel.channel_id)}
                  className="data-[state=checked]:bg-green-600"
                />
                <Label 
                  htmlFor={`channel-${channel.channel_id}`}
                  className={`text-sm font-medium ${
                    hiddenChannels.has(channel.channel_id) 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}
                >
                  {hiddenChannels.has(channel.channel_id) ? "Not Allowed" : "Allowed"}
                </Label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
