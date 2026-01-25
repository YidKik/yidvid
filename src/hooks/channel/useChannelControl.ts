
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChannelsGrid } from "./useChannelsGrid";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useHiddenChannels } from "./useHiddenChannels";

export const useChannelControl = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [showSetPinDialog, setShowSetPinDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [storedPin, setStoredPin] = useState("");
  const { session, isAuthenticated } = useSessionManager();
  
  // Use the centralized hidden channels hook
  const { 
    hiddenChannelIds, 
    isLoading: loadingHiddenChannels,
    invalidateAllQueries 
  } = useHiddenChannels();
  
  // Use our enhanced channels grid hook
  const { 
    allChannels,
    isLoading: channelsLoading,
    fetchError
  } = useChannelsGrid();

  // Client-side filtering for instant search results
  const filteredChannels = useMemo(() => {
    if (!allChannels || allChannels.length === 0) return [];
    
    if (!searchQuery.trim()) {
      return allChannels;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return allChannels.filter(channel => 
      channel.title.toLowerCase().includes(query)
    );
  }, [allChannels, searchQuery]);

  const loadLockStatus = async () => {
    if (!session?.user?.id) {
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('parental_locks')
        .select('pin, is_locked')
        .eq('user_id', session.user.id)
        .eq('lock_type', 'channel_control')
        .maybeSingle();

      if (error) {
        console.error("Error loading lock status:", error);
        return;
      }

      if (data) {
        setIsLocked(data.is_locked);
        setStoredPin(data.pin);
      }
    } catch (err) {
      console.error("Unexpected error loading lock status:", err);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadLockStatus();
    }
  }, [session?.user?.id, isAuthenticated]);

  const toggleChannel = async (channelId: string) => {
    if (isLocked) {
      setShowLockDialog(true);
      return;
    }

    if (!session?.user?.id) {
      toast.error("You must be logged in to manage channel preferences");
      return;
    }

    const isCurrentlyHidden = hiddenChannelIds.has(channelId);

    try {
      if (isCurrentlyHidden) {
        // Unhide the channel
        const { error } = await supabase
          .from('hidden_channels')
          .delete()
          .eq('user_id', session.user.id)
          .eq('channel_id', channelId);

        if (error) {
          console.error('Error unhiding channel:', error);
          throw error;
        }
        toast.success("Channel is now visible in your feed");
      } else {
        // Hide the channel
        const { error } = await supabase
          .from('hidden_channels')
          .insert({
            user_id: session.user.id,
            channel_id: channelId
          });

        if (error) {
          console.error('Error hiding channel:', error);
          throw error;
        }
        toast.success("Channel hidden from your feed");
      }

      // Use centralized invalidation to refresh all queries
      await invalidateAllQueries();
      
    } catch (error) {
      console.error('Error toggling channel visibility:', error);
      toast.error("Failed to update channel visibility");
    }
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      toast.error("PIN must be 6 digits");
      return;
    }

    if (!isAuthenticated || !session?.user?.id) {
      toast.error("You must be logged in to set a PIN");
      return;
    }

    const { error } = await supabase
      .from('parental_locks')
      .upsert({
        user_id: session.user.id,
        lock_type: 'channel_control',
        pin: pin,
        is_locked: true
      });

    if (error) {
      console.error('Error setting PIN:', error);
      toast.error("Failed to set PIN");
      return;
    }

    setStoredPin(pin);
    setIsLocked(true);
    setShowSetPinDialog(false);
    setPin("");
    toast.success("Parental lock enabled");
  };

  const handleUnlock = async () => {
    if (!isAuthenticated || !session?.user?.id) return;

    const { error } = await supabase
      .from('parental_locks')
      .update({ is_locked: false })
      .eq('user_id', session.user.id)
      .eq('lock_type', 'channel_control');

    if (error) {
      console.error('Error unlocking:', error);
      toast.error("Failed to unlock");
      return;
    }

    setIsLocked(false);
    setShowLockDialog(false);
  };

  const handleLock = async () => {
    if (!isAuthenticated || !session?.user?.id) return;

    const { error } = await supabase
      .from('parental_locks')
      .update({ is_locked: true })
      .eq('user_id', session.user.id)
      .eq('lock_type', 'channel_control');

    if (error) {
      console.error('Error locking:', error);
      toast.error("Failed to lock");
      return;
    }

    setIsLocked(true);
    toast.success("Channel Control locked");
  };

  const handleDelete = async () => {
    if (!isAuthenticated || !session?.user?.id) return;

    const { error } = await supabase
      .from('parental_locks')
      .delete()
      .eq('user_id', session.user.id)
      .eq('lock_type', 'channel_control');

    if (error) {
      console.error('Error deleting lock:', error);
      toast.error("Failed to remove parental control");
      return;
    }

    setIsLocked(false);
    setStoredPin("");
    setShowLockDialog(false);
  };

  return {
    isLoading: channelsLoading || loadingHiddenChannels,
    filteredChannels,
    hiddenChannels: hiddenChannelIds,
    isLocked,
    storedPin,
    searchQuery,
    setSearchQuery,
    showLockDialog,
    setShowLockDialog,
    showSetPinDialog,
    setShowSetPinDialog,
    pin,
    setPin,
    toggleChannel,
    handleSetPin,
    handleUnlock,
    handleLock,
    handleDelete
  };
};
