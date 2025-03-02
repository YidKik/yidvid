
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AddAdminDialogProps {
  showAddAdminDialog: boolean;
  setShowAddAdminDialog: (show: boolean) => void;
  newAdminEmail: string;
  setNewAdminEmail: (email: string) => void;
  handleAddAdmin: () => Promise<void>;
}

export const AddAdminDialog = ({
  showAddAdminDialog,
  setShowAddAdminDialog,
  newAdminEmail,
  setNewAdminEmail,
  handleAddAdmin
}: AddAdminDialogProps) => {
  return (
    <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Admin</DialogTitle>
          <DialogDescription>
            Enter the email address of the user you want to make an admin. The user must already have an account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddAdminDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddAdmin}>Add Admin</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
