
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

interface SetPinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSetPin: (e: React.FormEvent) => void;
  pin: string;
  onPinChange: (value: string) => void;
}

export const SetPinDialog = ({ isOpen, onClose, onSetPin, pin, onPinChange }: SetPinDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Set Parental Control PIN
          </DialogTitle>
          <DialogDescription>
            Create a 6-digit PIN to lock the Channel Control settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSetPin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="setPin">PIN</Label>
            <Input
              id="setPin"
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => onPinChange(e.target.value)}
              placeholder="Enter 6-digit PIN"
              className="text-center text-lg tracking-widest"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Set PIN
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
