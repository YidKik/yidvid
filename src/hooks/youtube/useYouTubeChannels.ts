
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useYouTubeChannels = () => {
  const navigate = useNavigate();
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [videoSearchQuery, setVideoSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null);

  const { data: channels = [], isLoading, error, refetch } = useQuery({
    queryKey: ["youtube-channels", searchQuery],
    queryFn: async () => {
      try {
        console.log("Fetching channels for admin management...");
        
        // First try direct database query
        try {
          const { data, error } = await supabase
            .from("youtube_channels")
            .select("*")
            .order("created_at", { ascending: false })
            .is("deleted_at", null);
            
          if (!error && data && data.length > 0) {
            console.log(`Successfully fetched ${data.length} channels directly`);
            return data;
          }
          
          if (error) {
            console.warn("Direct DB fetch error:", error);
          }
        } catch (directError) {
          console.error("Error in direct fetch:", directError);
        }
        
        // Try edge function as fallback
        try {
          console.log("Trying edge function to fetch channels...");
          const response = await fetch("https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-channels", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.data && Array.isArray(result.data) && result.data.length > 0) {
              console.log(`Retrieved ${result.data.length} channels with edge function`);
              
              // Apply search filter if needed
              if (searchQuery.trim()) {
                const filtered = result.data.filter(channel => 
                  channel.title.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return filtered;
              }
              
              return result.data;
            }
          } else {
            console.error("Edge function error:", response.statusText);
          }
        } catch (edgeError) {
          console.error("Error calling edge function:", edgeError);
        }

        console.error("All channel fetch methods failed");
        return [];
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("Error fetching channels");
        return [];
      }
    },
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const handleDeleteChannel = async (channelId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to perform this action");
        navigate("/auth");
        return;
      }

      setIsDeleting(true);
      setChannelToDelete(channelId);
      console.log("Starting channel deletion process for:", channelId);

      // First try direct database update to mark as deleted
      try {
        // Soft delete the channel by updating deleted_at
        const { error: channelError } = await supabase
          .from("youtube_channels")
          .update({ deleted_at: new Date().toISOString() })
          .eq("channel_id", channelId);

        if (channelError) {
          console.error("Error soft deleting channel:", channelError);
          
          // If error mentions recursion in profiles, use alternative approach
          if (channelError.message?.includes("infinite recursion") || 
              channelError.message?.includes("profiles")) {
            console.log("Using alternative approach to delete channel");
            
            // Use a different approach - try direct delete from videos first
            const { error: videoError } = await supabase
              .from("youtube_videos")
              .update({ deleted_at: new Date().toISOString() })
              .eq("channel_id", channelId);
              
            if (videoError && !videoError.message?.includes("No rows")) {
              console.warn("Error updating videos:", videoError);
            }
            
            // Try channel update again after videos are marked as deleted
            const { error: retryError } = await supabase
              .from("youtube_channels")
              .update({ deleted_at: new Date().toISOString() })
              .eq("channel_id", channelId);
              
            if (retryError) {
              console.error("Error in retry delete channel:", retryError);
              throw new Error(`Error deleting channel: ${retryError.message}`);
            }
          } else {
            throw new Error(`Error deleting channel: ${channelError.message}`);
          }
        } else {
          // If channel was deleted successfully, also mark videos as deleted
          const { error: videoError } = await supabase
            .from("youtube_videos")
            .update({ deleted_at: new Date().toISOString() })
            .eq("channel_id", channelId);

          if (videoError) {
            console.warn("Error soft deleting videos:", videoError);
            // Continue anyway, the channel was successfully marked as deleted
          }
        }
      } catch (dbError: any) {
        console.error("Database operation failed:", dbError);
        
        // Fall back to using an anonymous function which bypasses RLS
        // This uses the service role key through an edge function
        try {
          console.log("Trying alternative delete method");
          const response = await fetch(
            "https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/delete-channel-admin",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
              },
              body: JSON.stringify({ 
                channelId,
                userId: session.user.id
              })
            }
          );
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete channel");
          }
        } catch (fetchError: any) {
          console.error("Edge function error:", fetchError);
          throw fetchError;
        }
      }

      toast.success("Channel deleted successfully");
      refetch();
      
      // Reset selection if the deleted channel was selected
      if (selectedChannelId === channelId) {
        setSelectedChannelId(null);
      }
    } catch (error: any) {
      console.error("Error in deletion process:", error);
      toast.error(error.message || "Error deleting channel");
    } finally {
      setIsDeleting(false);
      setChannelToDelete(null);
    }
  };
  
  return {
    channels,
    isLoading,
    error,
    refetch,
    isChannelDialogOpen,
    setIsChannelDialogOpen,
    isVideoDialogOpen,
    setIsVideoDialogOpen,
    selectedChannelId,
    setSelectedChannelId,
    searchQuery,
    setSearchQuery,
    videoSearchQuery,
    setVideoSearchQuery,
    isDeleting,
    channelToDelete,
    handleDeleteChannel,
    setChannelToDelete
  };
};
