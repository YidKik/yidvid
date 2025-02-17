
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
            <Lock className="w-5 h-5 text-indigo-600" />
            {showDeleteConfirm ? "Remove Parental Control" : "Enter Parental Control PIN"}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {showDeleteConfirm 
              ? "Enter your PIN to remove the parental control. This will permanently remove the lock."
              : "This section is locked. Please enter your PIN to access Channel Control settings."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="pin" className="text-sm font-medium text-gray-700">
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
            <Alert variant="destructive" className="bg-red-50 border border-red-100">
              <AlertDescription className="text-sm">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-red-600 p-0 h-auto font-normal hover:text-red-700 hover:bg-transparent flex items-center gap-2 transition-colors"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove parental control
                </Button>
              </AlertDescription>
            </Alert>
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
              className={`px-4 py-2 text-sm font-medium shadow-sm transition-all ${
                showDeleteConfirm 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {showDeleteConfirm ? "Remove Lock" : "Unlock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
