
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChannelLockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
  onDelete: () => void;
  storedPin: string;
}

export const ChannelLockDialog = ({ isOpen, onClose, onUnlock, onDelete, storedPin }: ChannelLockDialogProps) => {
  const [pin, setPin] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === storedPin) {
      if (showDeleteConfirm) {
        onDelete();
        setShowDeleteConfirm(false);
      } else {
        onUnlock();
      }
      setPin("");
    } else {
      setPin("");
    }
  };

  const handleClose = () => {
    setPin("");
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            {showDeleteConfirm ? "Remove Parental Control" : "Enter Parental Control PIN"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {showDeleteConfirm 
              ? "Enter your PIN to remove the parental control. This will permanently remove the lock."
              : "This section is locked. Please enter your PIN to access Channel Control settings."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="pin" className="text-sm font-medium text-foreground">
              PIN
            </Label>
            <Input
              id="pin"
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter 6-digit PIN"
              className="text-center text-lg tracking-widest font-mono h-12 border-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {!showDeleteConfirm && (
            <div className="flex justify-center">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full max-w-sm py-2 px-4 bg-card border-2 border-border rounded-lg text-foreground hover:bg-muted hover:border-border transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="font-medium">Remove Parental Control</span>
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium transition-colors"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant={showDeleteConfirm ? "destructive" : "default"}
              className="px-4 py-2 text-sm font-medium shadow-sm transition-all"
            >
              {showDeleteConfirm ? "Remove Lock" : "Unlock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
