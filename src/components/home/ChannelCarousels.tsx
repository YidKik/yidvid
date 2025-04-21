
import React, { useState, useEffect } from "react";
import { ChannelCarousel } from "./ChannelCarousel";
import { supabase } from "@/integrations/supabase/client";
import { YoutubeChannelsTable } from "@/integrations/supabase/types/youtube-channels";

export interface ChannelItem {
  id: string;
  channel_id: string;
  title: string;
  thumbnail_url: string | null;
}

interface ChannelCarouselsProps {
  isLoading: boolean;
}

export const ChannelCarousels = ({ isLoading }: ChannelCarouselsProps) => {
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChannels() {
      try {
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("id, channel_id, title, thumbnail_url")
          .is("deleted_at", null)
          .limit(50);

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

  // Use different shuffle keys for each row
  const rowShuffleKeys = [1, 2, 3];

  if (isLoading || loading) {
    return (
      <div className="space-y-16 py-8">
        {[0, 1, 2].map((index) => (
          <div key={index} className="overflow-hidden py-4">
            <div className="flex gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-none rounded-full w-20 h-20 md:w-28 md:h-28 bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-16 py-8">
      {/* Three rows with different directions and speeds */}
      <div className="overflow-hidden py-4">
        <ChannelCarousel 
          channels={channels} 
          direction="ltr" 
          speed={35} 
          shuffleKey={rowShuffleKeys[0]} 
        />
      </div>
      
      <div className="overflow-hidden py-4">
        <ChannelCarousel 
          channels={channels} 
          direction="rtl" 
          speed={30} 
          shuffleKey={rowShuffleKeys[1]} 
        />
      </div>
      
      <div className="overflow-hidden py-4">
        <ChannelCarousel 
          channels={channels} 
          direction="ltr" 
          speed={40} 
          shuffleKey={rowShuffleKeys[2]} 
        />
      </div>
    </div>
  );
};
