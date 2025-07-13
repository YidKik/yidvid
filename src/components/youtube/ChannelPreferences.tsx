
import { Card } from "@/components/ui/card";
import { ChannelLockDialog } from "./ChannelLockDialog";
import { SetPinDialog } from "./SetPinDialog";
import { ChannelControlHeader } from "./ChannelControlHeader";
import { ChannelFilteredList } from "./ChannelFilteredList";
import { useChannelControl } from "@/hooks/channel/useChannelControl";
import { useSessionManager } from "@/hooks/useSessionManager";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const ChannelControl = () => {
  const {
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
  } = useChannelControl();

  const { session, isAuthenticated, handleSignInClick } = useSessionManager();
  const [authChecked, setAuthChecked] = useState(false);

  // Enhanced auth debugging
  useEffect(() => {
    // Log detailed auth information
    console.log("Auth state in ChannelControl:", { 
      isAuthenticated, 
      hasUser: !!session?.user,
      userId: session?.user?.id || "none" 
    });
    setAuthChecked(true);
  }, [isAuthenticated, session]);

  // Display a toast when authentication state changes
  useEffect(() => {
    if (authChecked) {
      if (!isAuthenticated) {
        toast.info("Please sign in to manage channel preferences", { duration: 3000 });
      }
    }
  }, [authChecked, isAuthenticated]);

  if (isLoading) {
    return <div className="text-sm md:text-base">Loading channels...</div>;
  }

  if (!isAuthenticated || !session?.user?.id) {
    return (
      <Card className="p-3 md:p-6 bg-[#F6F6F7]">
        <div className="space-y-4 text-center py-6">
          <AlertDescription className="text-gray-700 mb-4">
            You need to be signed in to manage your channel preferences.
          </AlertDescription>
          <Button 
            onClick={handleSignInClick}
            className="flex mx-auto items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign in to continue
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-8 bg-gradient-to-br from-white to-primary/5 border-2 border-primary/20 shadow-lg rounded-3xl">
      <div className="space-y-6">
        <ChannelControlHeader
          isLocked={isLocked}
          storedPin={storedPin}
          onLock={handleLock}
          onShowLockDialog={() => setShowLockDialog(true)}
          onShowSetPinDialog={() => setShowSetPinDialog(true)}
        />

        <ChannelFilteredList 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredChannels={filteredChannels}
          hiddenChannels={hiddenChannels}
          onToggle={toggleChannel}
          isLocked={isLocked}
        />
      </div>

      <ChannelLockDialog 
        isOpen={showLockDialog}
        onClose={() => setShowLockDialog(false)}
        onUnlock={handleUnlock}
        onDelete={handleDelete}
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
