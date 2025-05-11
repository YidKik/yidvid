
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminPinDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  pinValue: string;
  setPinValue: (value: string) => void;
  onUnlock: () => void;
}

export const AdminPinDialog = ({
  showDialog,
  setShowDialog,
  pinValue,
  setPinValue,
  onUnlock
}: AdminPinDialogProps) => {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Admin Access</DialogTitle>
          <DialogDescription>
            Enter the admin PIN to access the dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Input
            type="password"
            placeholder="Enter PIN"
            value={pinValue}
            onChange={(e) => setPinValue(e.target.value)}
            maxLength={10}
            className="text-center text-lg tracking-widest"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onUnlock();
              }
            }}
          />
          <Button onClick={onUnlock}>Unlock</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
