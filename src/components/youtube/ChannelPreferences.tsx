
import { Card } from "@/components/ui/card";
import { ChannelLockDialog } from "./ChannelLockDialog";
import { SetPinDialog } from "./SetPinDialog";
import { ChannelControlHeader } from "./ChannelControlHeader";
import { ChannelFilteredList } from "./ChannelFilteredList";
import { useChannelControl } from "@/hooks/channel/useChannelControl";

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

  if (isLoading) {
    return <div>Loading channels...</div>;
  }

  return (
    <Card className="p-4 md:p-6 bg-[#F6F6F7]">
      <div className="space-y-4 md:space-y-6">
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
