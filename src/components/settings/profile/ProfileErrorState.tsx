
import { User, LogOut, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProfileErrorStateProps {
  userEmail: string | null;
  isLoggingOut: boolean;
  handleLogout: () => Promise<void>;
}

export const ProfileErrorState = ({ userEmail, isLoggingOut, handleLogout }: ProfileErrorStateProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleFastLogout = async () => {
    // Cancel any in-flight queries immediately
    queryClient.cancelQueries();
    
    // Start the logout process without toast
    handleLogout();
  };

  const handleDeleteAccount = async () => {
    try {
      // Cancel any in-flight queries
      queryClient.cancelQueries();
      
      const { error } = await supabase.rpc('delete_user', {});
      if (error) {
        console.error("Error deleting account:", error);
        return;
      }
      
      // Navigate first for immediate feedback
      setIsDeleteDialogOpen(false);
      navigate("/");
      
      // Then do the actual sign out
      await supabase.auth.signOut();
      
      // Clear user data
      queryClient.removeQueries({ queryKey: ["profile"] });
      queryClient.removeQueries({ queryKey: ["user-profile"] });
      queryClient.removeQueries({ queryKey: ["session"] });
      queryClient.setQueryData(["session"], null);
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  // Display user email immediately from props, with fallback to first part of email
  const displayEmail = userEmail || "User";
  const emailInitial = displayEmail.substring(0, 1).toUpperCase();

  return (
    <section className="mb-8">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {emailInitial || <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-medium">{displayEmail}</p>
              <p className="text-sm text-muted-foreground">
                Your account
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
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
        </div>
      </Card>
    </section>
  );
};
