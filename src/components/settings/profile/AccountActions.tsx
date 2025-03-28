
import { Button } from "@/components/ui/button"; 
import { LogOut, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AccountActionsProps {
  isLoggingOut: boolean;
  handleLogout: () => Promise<void>;
}

export const AccountActions = ({ isLoggingOut, handleLogout }: AccountActionsProps) => {
  const isMobile = useIsMobile();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  return (
    <div className={`flex ${isMobile ? 'gap-1.5 w-full' : 'gap-2'} mt-1 md:mt-0`}>
      <Button
        variant="outline"
        size={isMobile ? "sm" : "default"}
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`${isMobile ? 'text-xs py-0.5 h-6 px-2 flex-1' : ''} flex items-center gap-1`}
      >
        <LogOut className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
        {isLoggingOut ? (isMobile ? "..." : "Signing out...") : (isMobile ? "Sign out" : "Sign out")}
      </Button>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className={`${isMobile ? 'text-xs py-0.5 h-6 px-2 flex-1' : ''} flex items-center gap-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50`}
          >
            <Trash2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            {isMobile ? "Delete" : "Delete Account"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // Placeholder for account deletion logic
                setIsDeleteDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
