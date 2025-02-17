
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock } from "lucide-react";

interface ChannelLockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
  storedPin: string;
}

export const ChannelLockDialog = ({ isOpen, onClose, onUnlock, storedPin }: ChannelLockDialogProps) => {
  const [pin, setPin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === storedPin) {
      onUnlock();
      setPin("");
      toast.success("Channel Control unlocked");
    } else {
      toast.error("Incorrect PIN");
      setPin("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Enter Parental Control PIN
          </DialogTitle>
          <DialogDescription>
            This section is locked. Please enter your PIN to access Channel Control settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">PIN</Label>
            <Input
              id="pin"
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter 6-digit PIN"
              className="text-center text-lg tracking-widest"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Unlock
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
