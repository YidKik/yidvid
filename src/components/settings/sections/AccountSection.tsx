
import { Card } from "@/components/ui/card";
import { LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { ProfileSection } from "@/components/settings/ProfileSection";

export const AccountSection = () => {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error signing out");
        return;
      }
      navigate("/");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("An error occurred while signing out");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_user', {});
      if (error) {
        toast.error("Error deleting account");
        return;
      }
      await supabase.auth.signOut();
      setIsDeleteDialogOpen(false);
      navigate("/");
      toast.success("Account deleted successfully");
    } catch (error) {
      toast.error("An error occurred while deleting your account");
    }
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold text-primary/80 mb-4">Account</h2>
      <Card className="p-6">
        <div className="flex flex-col space-y-6">
          <ProfileSection />
          
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Account
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
