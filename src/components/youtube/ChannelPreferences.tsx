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

  // Load user's hidden channels from localStorage
  useState(() => {
    const savedHiddenChannels = localStorage.getItem("hiddenChannels");
    if (savedHiddenChannels) {
      setHiddenChannels(new Set(JSON.parse(savedHiddenChannels)));
    }
  });

  const toggleChannel = (channelId: string) => {
    const newHiddenChannels = new Set(hiddenChannels);
    if (newHiddenChannels.has(channelId)) {
      newHiddenChannels.delete(channelId);
    } else {
      newHiddenChannels.add(channelId);
    }
    setHiddenChannels(newHiddenChannels);
    localStorage.setItem(
      "hiddenChannels",
      JSON.stringify(Array.from(newHiddenChannels))
    );
    
    toast.success(
      `Channel ${newHiddenChannels.has(channelId) ? "hidden" : "visible"}`
    );
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