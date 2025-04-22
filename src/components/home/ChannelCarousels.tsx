
import React, { useState, useEffect } from "react";
import { ChannelCarousel } from "./ChannelCarousel";
import { supabase } from "@/integrations/supabase/client";
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
          .limit(100);

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
  const rowShuffleKeys = [1, 2, 3, 4, 5, 6];

  if (isLoading || loading) {
    return (
      <div className="space-y-2 py-2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="overflow-hidden">
            <div className="flex gap-2 px-6 md:px-16">
              {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-none rounded-full w-4 h-4 md:w-5 md:h-5 bg-gray-200 animate-pulse"
                  style={{animationDelay: `${i * 0.05}s`}}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1 py-1">
      {/* Six rows with different directions and speeds */}
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden py-1"
      >
        <ChannelCarousel 
          channels={channels} 
          direction="ltr" 
          speed={40} 
          shuffleKey={1} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="overflow-hidden py-1"
      >
        <ChannelCarousel 
          channels={channels} 
          direction="rtl" 
          speed={30} 
          shuffleKey={2} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="overflow-hidden py-1"
      >
        <ChannelCarousel 
          channels={channels} 
          direction="ltr" 
          speed={35} 
          shuffleKey={3} 
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="overflow-hidden py-1"
      >
        <ChannelCarousel 
          channels={channels} 
          direction="rtl" 
          speed={38} 
          shuffleKey={4} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="overflow-hidden py-1"
      >
        <ChannelCarousel 
          channels={channels} 
          direction="ltr" 
          speed={32} 
          shuffleKey={5} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="overflow-hidden py-1"
      >
        <ChannelCarousel 
          channels={channels} 
          direction="rtl" 
          speed={45} 
          shuffleKey={6} 
        />
      </motion.div>
    </div>
  );
};
