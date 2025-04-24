
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChannelsGrid } from "./useChannelsGrid";
import { useAuth } from "@/hooks/useAuth";

export const useChannelControl = () => {
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [showSetPinDialog, setShowSetPinDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [storedPin, setStoredPin] = useState("");
  const { isAuthenticated, session } = useAuth();
  
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
    if (!isAuthenticated || !session?.user?.id) return;
    
    const { data, error } = await supabase
      .from('parental_locks')
      .select('pin, is_locked')
      .eq('user_id', session.user.id)
      .eq('lock_type', 'channel_control')
      .maybeSingle();

    if (data) {
      setIsLocked(data.is_locked);
      setStoredPin(data.pin);
    }
  };

  const loadHiddenChannels = async () => {
    if (!isAuthenticated || !session?.user?.id) return;

    const { data: hiddenChannelsData, error } = await supabase
      .from('hidden_channels')
      .select('channel_id')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error loading hidden channels:', error);
      return;
    }

    setHiddenChannels(new Set(hiddenChannelsData?.map(hc => hc.channel_id) || []));
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadHiddenChannels();
      loadLockStatus();
    }
  }, [isAuthenticated, session]);

  const toggleChannel = async (channelId: string) => {
    if (isLocked) {
      setShowLockDialog(true);
      return;
    }

    if (!isAuthenticated || !session?.user?.id) {
      toast.error("You must be logged in to manage channel preferences");
      return;
    }

    const newHiddenChannels = new Set(hiddenChannels);
    const isCurrentlyHidden = newHiddenChannels.has(channelId);

    try {
      if (isCurrentlyHidden) {
        const { error } = await supabase
          .from('hidden_channels')
          .delete()
          .eq('user_id', session.user.id)
          .eq('channel_id', channelId);

        if (error) throw error;
        newHiddenChannels.delete(channelId);
      } else {
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
    isLoading,
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
