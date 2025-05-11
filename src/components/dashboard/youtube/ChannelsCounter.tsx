
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export const ChannelsCounter = () => {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChannelCount = async () => {
    try {
      setIsLoading(true);
      
      // Try to get count directly from the database
      const { count: directCount, error } = await supabase
        .from("youtube_channels")
        .select("*", { count: 'exact', head: true })
        .is("deleted_at", null);
        
      if (!error && directCount !== null) {
        setCount(directCount);
        setIsLoading(false);
        return;
      }
      
      // If there was an error, try the edge function
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");
        
        const { data: channelData, error: funcError } = await supabase.functions.invoke(
          'get-public-channels',
          { method: 'GET' }
        );
        
        if (funcError) throw funcError;
        
        if (channelData && Array.isArray(channelData.data)) {
          setCount(channelData.data.length);
        } else {
          console.log("No valid channel data received");
          setCount(0);
        }
      } catch (funcErr) {
        console.error("Error fetching from edge function:", funcErr);
        setCount(0);
      }
    } catch (err) {
      console.error("Error fetching channel count:", err);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup real-time listener for channel changes
  useEffect(() => {
    fetchChannelCount();
    
    // Subscribe to changes in youtube_channels table
    const channel = supabase
      .channel('public:youtube_channels')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'youtube_channels'
        },
        () => {
          // Refetch channel count when any change happens
          fetchChannelCount();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-full h-6 w-24"></div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Total Channels:</span>
      <Badge variant="secondary" className="text-sm py-1 px-3">
        {count !== null ? count : "..."}
      </Badge>
    </div>
  );
};
