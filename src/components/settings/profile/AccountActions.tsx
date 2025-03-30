
import { Button } from "@/components/ui/button";
import { LogOut, Trash2, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import { useQuery } from "@tanstack/react-query";

interface AccountActionsProps {
  isLoggingOut: boolean;
  handleLogout: () => Promise<void>;
}

export const AccountActions = ({ isLoggingOut, handleLogout }: AccountActionsProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Simple direct admin check that won't run into RLS issues
  const { data: adminStatus } = useQuery({
    queryKey: ["user-admin-status"],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return { isAdmin: false };
        
        // Simplified query that won't trigger RLS recursion
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Admin check error:", error);
          return { isAdmin: false };
        }

        return { isAdmin: Boolean(data?.is_admin) };
      } catch (err) {
        console.error("Error checking admin status:", err);
        return { isAdmin: false };
      }
    },
    staleTime: 60000, // 1 minute cache
  });

  const isAdmin = adminStatus?.isAdmin || false;

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_user', {});
      if (error) {
        toast.error("Error deleting account");
        return;
      }
      
      // Navigate first for immediate feedback
      setIsDeleteDialogOpen(false);
      navigate("/");
      toast.success("Account deleted successfully");
      
      // Then sign out
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

  const handleAdminDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-4">
      {isAdmin && (
        <Button
          onClick={handleAdminDashboard}
          variant="outline"
          className="flex items-center justify-center gap-2 text-primary hover:text-primary-foreground hover:bg-primary"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Admin Dashboard</span>
        </Button>
      )}
      
      <Button
        onClick={handleLogout}
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
