
import React, { useState, useEffect } from "react";
import { ChannelCarousel } from "./ChannelCarousel";
import { supabase } from "@/integrations/supabase/client";
import { YoutubeChannelsTable } from "@/integrations/supabase/types/youtube-channels";
import { motion } from "framer-motion";

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
      <div className="space-y-8 py-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="overflow-hidden">
            <div className="flex gap-4 px-6 md:px-16">
              {Array.from({ length: 10 }).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-none rounded-full w-16 h-16 md:w-24 md:h-24 bg-gray-200 animate-pulse"
                  style={{animationDelay: `${i * 0.1}s`}}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2">
      {/* Three rows with different directions and visible speeds */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden py-2"
      >
        <ChannelCarousel 
          channels={channels} 
          direction="ltr" 
          speed={18} 
          shuffleKey={rowShuffleKeys[0]} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="overflow-hidden py-2"
      >
        <ChannelCarousel 
          channels={channels} 
          direction="rtl" 
          speed={22} 
          shuffleKey={rowShuffleKeys[1]} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="overflow-hidden py-2"
      >
        <ChannelCarousel 
          channels={channels} 
          direction="ltr" 
          speed={26} 
          shuffleKey={rowShuffleKeys[2]} 
        />
      </motion.div>
    </div>
  );
};
