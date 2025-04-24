import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useChannelControl = () => {
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [showSetPinDialog, setShowSetPinDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [storedPin, setStoredPin] = useState("");

  const loadLockStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

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
    loadHiddenChannels();
    loadLockStatus();
  }, []);

  const { data: channels, isLoading } = useQuery({
    queryKey: ["youtube-channels", searchQuery],
    queryFn: async () => {
      try {
        const response = await fetch(
          `https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-channels${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
            }
          }
        );
        
        if (response.ok) {
          const result = await response.json();
          if (result.data && Array.isArray(result.data)) {
            return result.data;
          }
        } else {
          console.warn("Edge function response not OK:", response.statusText);
        }
        
        let query = supabase
          .from("youtube_channels")
          .select("*")
          .is("deleted_at", null)
          .order("title", { ascending: true });
          
        if (searchQuery) {
          query = query.ilike("title", `%${searchQuery}%`);
        }
        
        const { data, error } = await query;

        if (error) {
          console.error("Error fetching channels:", error);
          toast.error("Failed to load channels");
          return [];
        }

        return data || [];
      } catch (err) {
        console.error("Error in channel query:", err);
        toast.error("Failed to load channels");
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const toggleChannel = async (channelId: string) => {
    if (isLocked) {
      setShowLockDialog(true);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
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

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

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
