
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChannelCarousel } from "./ChannelCarousel";

// Define and export the ChannelItem interface for reuse
export interface ChannelItem {
  id: string;
  channel_id: string;
  title: string;
  thumbnail_url: string | null;
}

export const ChannelCarousels = () => {
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchChannels() {
      try {
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("id, channel_id, title, thumbnail_url")
          .is("deleted_at", null)
          .limit(200);

        if (error) {
          console.error("Error fetching channels:", error);
          throw error;
        }

        const formattedChannels = data.map((channel) => ({
          id: channel.id,
          channel_id: channel.channel_id,
          title: channel.title,
          thumbnail_url: channel.thumbnail_url
        }));

        setChannels(formattedChannels);
      } catch (err) {
        console.error("Error in channel fetch:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchChannels();
  }, []);

  // Create multiple rows of channels for the homepage
  const rowShuffleKeys = [1, 2, 3, 4]; // Four rows
  const rowDirections = ["ltr", "rtl", "ltr", "rtl"];
  const rowSpeeds = [20, 25, 15, 30]; // Different speeds for visual variety

  if (loading || channels.length === 0) {
    return null;
  }

  return (
    <div className="my-4 space-y-0.5 md:space-y-1">
      {rowShuffleKeys.map((shuffleKey, index) => (
        <ChannelCarousel
          key={shuffleKey}
          channels={channels}
          direction={rowDirections[index % rowDirections.length] as "ltr" | "rtl"}
          speed={rowSpeeds[index % rowSpeeds.length]}
          shuffleKey={shuffleKey}
        />
      ))}
    </div>
  );
};
