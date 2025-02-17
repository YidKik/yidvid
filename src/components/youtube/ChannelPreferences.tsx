
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, Search, Lock, Unlock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChannelSearch } from "@/components/youtube/ChannelSearch";
import { ChannelLockDialog } from "./ChannelLockDialog";
import { ChannelListItem } from "./ChannelListItem";
import { SetPinDialog } from "./SetPinDialog";

export const ChannelControl = () => {
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

    setHiddenChannels(new Set(hiddenChannelsData.map(hc => hc.channel_id)));
  };

  useEffect(() => {
    loadHiddenChannels();
    loadLockStatus();
  }, []);

  const { data: channels, isLoading } = useQuery({
    queryKey: ["youtube-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .order("title", { ascending: true });

      if (error) {
        console.error("Error fetching channels:", error);
        toast.error("Failed to load channels");
        return [];
      }

      return data || [];
    },
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

  const filteredChannels = channels?.filter(channel =>
    channel.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading channels...</div>;
  }

  return (
    <Card className="p-6 bg-[#F6F6F7]">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Channel Control</h3>
              <p className="text-sm text-gray-600 mt-1">
                Customize your viewing experience by selecting which channels you want to include in your feed. 
                This helps create a safe and personalized environment for you and your family.
              </p>
            </div>
          </div>
          <div>
            {storedPin ? (
              isLocked ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowLockDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Unlock Controls
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handleLock}
                  className="flex items-center gap-2"
                >
                  <Unlock className="h-4 w-4" />
                  Lock Controls
                </Button>
              )
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setShowSetPinDialog(true)}
                className="flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Set Parental Lock
              </Button>
            )}
          </div>
        </div>

        <div className={`relative ${isLocked ? 'pointer-events-none' : ''}`}>
          {isLocked && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 rounded-lg" />
          )}
          
          <Alert className="bg-[#F1F0FB] border-gray-200">
            <AlertDescription className="text-gray-700">
              Use the toggles below to manage your channel preferences. When a channel is marked as "Allowed", 
              its content will appear in your feed. Channels marked as "Not Allowed" won't show up in your recommendations or search results.
            </AlertDescription>
          </Alert>

          <div className="mb-6 mt-6">
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
              <Search className="h-4 w-4 text-gray-500" />
              <ChannelSearch value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto scrollbar-hide space-y-3">
            {filteredChannels?.map((channel) => (
              <ChannelListItem
                key={channel.channel_id}
                channel={channel}
                isHidden={hiddenChannels.has(channel.channel_id)}
                onToggle={toggleChannel}
              />
            ))}
          </div>
        </div>
      </div>

      <ChannelLockDialog 
        isOpen={showLockDialog}
        onClose={() => setShowLockDialog(false)}
        onUnlock={handleUnlock}
        storedPin={storedPin}
      />

      <SetPinDialog
        isOpen={showSetPinDialog}
        onClose={() => setShowSetPinDialog(false)}
        onSetPin={handleSetPin}
        pin={pin}
        onPinChange={setPin}
      />
    </Card>
  );
};
