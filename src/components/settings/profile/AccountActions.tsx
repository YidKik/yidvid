
import { LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleFastLogout = async () => {
    // This triggers an immediate logout flow
    // No need to show feedback toast here as the main logout will do that
    // and navigating away happens automatically in the logout flow
    handleLogout();
  };

  const handleDeleteAccount = async () => {
    try {
      // Cancel any in-flight queries
      queryClient.cancelQueries();
      
      const { error } = await supabase.rpc('delete_user', {});
      if (error) {
        toast.error("Error deleting account");
        return;
      }
      
      // Navigate first for immediate feedback
      setIsDeleteDialogOpen(false);
      navigate("/");
      toast.success("Account deleted successfully");
      
      // Then do the actual sign out
      await supabase.auth.signOut();
      
      // Clear user data
      queryClient.removeQueries({ queryKey: ["profile"] });
      queryClient.removeQueries({ queryKey: ["user-profile"] });
      queryClient.removeQueries({ queryKey: ["session"] });
      queryClient.setQueryData(["session"], null);
      
    } catch (error) {
      toast.error("An error occurred while deleting your account");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <Button
        onClick={handleFastLogout}
        variant="outline"
        className="flex items-center justify-center gap-2"
        disabled={isLoggingOut}
      >
        <LogOut className="h-4 w-4" />
        <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
      </Button>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
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
              onClick={handleDeleteAccount}
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
