
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
    <section className="mt-8">
      <h2 className="text-2xl font-semibold text-primary/80 mb-4">Account Actions</h2>
      <Card className="p-6">
        <div className="space-y-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-6 text-gray-700 hover:text-gray-900 border-2 hover:border-gray-300 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </Button>
          
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-6 text-red-600 hover:text-red-700 border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
              >
                <Trash2 className="h-5 w-5" />
                <span className="font-medium">Delete Account</span>
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
      </Card>
    </section>
  );
};
