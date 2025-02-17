
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
      toast.success(showDeleteConfirm ? "Parental control removed" : "Channel Control unlocked");
    } else {
      toast.error("Incorrect PIN");
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
            <Lock className="w-5 h-5" />
            {showDeleteConfirm ? "Remove Parental Control" : "Enter Parental Control PIN"}
          </DialogTitle>
          <DialogDescription>
            {showDeleteConfirm 
              ? "Enter your PIN to remove the parental control. This will permanently remove the lock."
              : "This section is locked. Please enter your PIN to access Channel Control settings."
            }
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
          
          {!showDeleteConfirm && (
            <Alert variant="destructive" className="bg-red-50">
              <AlertDescription className="text-sm">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-red-600 p-0 h-auto font-normal hover:text-red-700 hover:bg-transparent"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove parental control
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant={showDeleteConfirm ? "destructive" : "default"}>
              {showDeleteConfirm ? "Remove Lock" : "Unlock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
