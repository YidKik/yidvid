import { useState } from "react";
import { useChannelControl } from "@/hooks/channel/useChannelControl";
import { useIsMobile } from "@/hooks/use-mobile";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tv2, Search, Lock, Unlock, ShieldCheck, Loader2, KeyRound, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const SettingsContent = () => {
  const { isMobile } = useIsMobile();
  const {
    isLoading, filteredChannels, hiddenChannels, isLocked, storedPin,
    searchQuery, setSearchQuery, showLockDialog, setShowLockDialog,
    showSetPinDialog, setShowSetPinDialog, pin, setPin,
    toggleChannel, handleSetPin, handleUnlock, handleLock, handleDelete
  } = useChannelControl();

  const [unlockPin, setUnlockPin] = useState("");
  const [unlockError, setUnlockError] = useState(false);

  const handleUnlockSubmit = () => {
    if (unlockPin === storedPin) {
      handleUnlock();
      setUnlockPin("");
      setUnlockError(false);
    } else {
      setUnlockError(true);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tv2 className="h-5 w-5 text-brand" />
          <h3 className="text-base font-bold text-foreground dark:text-foreground">Channel Control</h3>
        </div>
        <div className="flex items-center gap-2">
          {storedPin ? (
            <Button
              variant="outline"
              size="sm"
              onClick={isLocked ? () => setShowLockDialog(true) : handleLock}
              className="h-8 rounded-card text-xs font-semibold gap-1.5 border-border dark:border-border"
            >
              {isLocked ? <Lock className="h-3.5 w-3.5 text-brand" /> : <Unlock className="h-3.5 w-3.5 text-green-600" />}
              {isLocked ? "Locked" : "Lock"}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSetPinDialog(true)}
              className="h-8 rounded-card text-xs font-semibold gap-1.5 border-border dark:border-border"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Set PIN
            </Button>
          )}
        </div>
      </div>

      <div className="bg-muted dark:bg-background border border-border dark:border-border rounded-card p-4 mb-4">
        <p className="text-sm font-medium text-foreground dark:text-foreground mb-1">
          Control your feed
        </p>
        <p className="text-xs text-muted-foreground dark:text-muted-foreground leading-relaxed">
          This section lets you choose which channels appear in your feed, search results, and recommendations. 
          Toggle channels off to hide them completely from your experience. Use the parental PIN lock to prevent 
          changes from being made without your permission.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search channels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-11 rounded-control border-border dark:border-border bg-muted dark:bg-background text-sm"
        />
      </div>

      {/* Channel List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filteredChannels.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Tv2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">No channels found</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
          {filteredChannels.map((channel) => {
            const isHidden = hiddenChannels.has(channel.channel_id);
            return (
              <div
                key={channel.channel_id}
                className={cn(
                  "flex items-center gap-3 py-2.5 px-3 rounded-control transition-colors",
                  isHidden
                    ? "bg-muted dark:bg-background opacity-60"
                    : "hover:bg-surface-hover dark:hover:bg-background"
                )}
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={channel.thumbnail_url || ""} alt={channel.title} />
                  <AvatarFallback className="bg-surface-active dark:bg-secondary text-icon text-xs font-bold">
                    {channel.title[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-semibold truncate",
                    isHidden ? "text-muted-foreground" : "text-foreground dark:text-foreground"
                  )}>
                    {channel.title}
                  </p>
                </div>
                <Switch
                  checked={!isHidden}
                  onCheckedChange={() => toggleChannel(channel.channel_id)}
                  disabled={isLocked}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Unlock Dialog */}
      <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <DialogContent className="rounded-dialog max-w-sm bg-white dark:bg-card border border-border dark:border-border shadow-overlay">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-control bg-brand-soft">
              <KeyRound className="h-6 w-6 text-brand" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground dark:text-foreground">Enter PIN to Unlock</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
              Enter your 6-digit PIN to modify channel settings.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              type="password"
              maxLength={6}
              placeholder="••••••"
              value={unlockPin}
              onChange={(e) => { setUnlockPin(e.target.value.replace(/\D/g, "")); setUnlockError(false); }}
              className={cn("text-center text-2xl tracking-widest h-12 rounded-card", unlockError && "border-brand")}
            />
            {unlockError && <p className="text-xs text-brand text-center mt-2">Incorrect PIN</p>}
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button onClick={handleUnlockSubmit} className="w-full bg-primary hover:bg-primary-hover text-white rounded-control h-11 font-semibold">
              Unlock
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-muted-foreground hover:text-brand text-xs">
              <Trash2 className="h-3 w-3 mr-1" /> Remove Parental Lock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set PIN Dialog */}
      <Dialog open={showSetPinDialog} onOpenChange={setShowSetPinDialog}>
        <DialogContent className="rounded-dialog max-w-sm bg-white dark:bg-card border border-border dark:border-border shadow-overlay">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-control bg-brand-soft">
              <ShieldCheck className="h-6 w-6 text-brand" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground dark:text-foreground">Set Parental PIN</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
              Create a 6-digit PIN to lock channel settings and prevent changes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSetPin}>
            <Input
              type="password"
              maxLength={6}
              placeholder="••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-widest h-12 rounded-card mb-4 bg-muted dark:bg-background border-border dark:border-border"
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white rounded-control h-11 font-semibold">
              Set PIN & Lock
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
