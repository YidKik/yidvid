
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChannelsGrid } from "./useChannelsGrid";
import { useSessionManager } from "@/hooks/useSessionManager";

export const useChannelControl = () => {
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [showSetPinDialog, setShowSetPinDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [storedPin, setStoredPin] = useState("");
  const [loadingHiddenChannels, setLoadingHiddenChannels] = useState(false);
  const { session, isAuthenticated } = useSessionManager();
  
  // Use our enhanced channels grid hook
  const { 
    manuallyFetchedChannels: channels, 
    isLoading, 
    fetchError, 
    searchQuery: gridSearchQuery,
    setSearchQuery: setGridSearchQuery
  } = useChannelsGrid();

  // Sync the search queries
  useEffect(() => {
    if (gridSearchQuery !== searchQuery) {
      setGridSearchQuery(searchQuery);
    }
  }, [searchQuery, gridSearchQuery, setGridSearchQuery]);

  const loadLockStatus = async () => {
    if (!session?.user?.id) {
      console.log("Cannot load lock status: No user ID");
      return;
    }
    
    try {
      console.log("Loading lock status for user:", session.user.id);
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
        console.log("Lock status loaded:", data.is_locked);
        setIsLocked(data.is_locked);
        setStoredPin(data.pin);
      }
    } catch (err) {
      console.error("Unexpected error loading lock status:", err);
    }
  };

  const loadHiddenChannels = async () => {
    if (!session?.user?.id) {
      console.log("Cannot load hidden channels: No user ID");
      return;
    }

    setLoadingHiddenChannels(true);
    try {
      console.log("Loading hidden channels for user:", session.user.id);
      const { data: hiddenChannelsData, error } = await supabase
        .from('hidden_channels')
        .select('channel_id')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error loading hidden channels:', error);
        return;
      }

      const channelIds = hiddenChannelsData?.map(hc => hc.channel_id) || [];
      console.log(`Found ${channelIds.length} hidden channels`);
      setHiddenChannels(new Set(channelIds));
    } catch (err) {
      console.error('Unexpected error loading hidden channels:', err);
    } finally {
      setLoadingHiddenChannels(false);
    }
  };

  useEffect(() => {
    // Debug the session state
    console.log("Session state in useChannelControl:", { 
      userId: session?.user?.id, 
      isAuthenticated,
      email: session?.user?.email 
    });
    
    if (session?.user?.id) {
      loadHiddenChannels();
      loadLockStatus();
    } else {
      console.log("No user session detected for channel control");
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

    const newHiddenChannels = new Set(hiddenChannels);
    const isCurrentlyHidden = newHiddenChannels.has(channelId);

    try {
      // Debug user information
      console.log("Toggle channel for user:", session.user.id, "Channel:", channelId);
      console.log("Action:", isCurrentlyHidden ? "unhiding" : "hiding");
      
      if (isCurrentlyHidden) {
        const { error } = await supabase
          .from('hidden_channels')
          .delete()
          .eq('user_id', session.user.id)
          .eq('channel_id', channelId);

        if (error) {
          console.error('Error unhiding channel:', error);
          throw error;
        }
        newHiddenChannels.delete(channelId);
      } else {
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

  // Filter the channels based on search query
  const filteredChannels = channels || [];

  return {
    isLoading: isLoading || loadingHiddenChannels,
    filteredChannels,
    hiddenChannels,
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
