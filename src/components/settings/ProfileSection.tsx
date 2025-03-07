import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfileAvatar } from "./profile/ProfileAvatar";
import { ProfileInfo } from "./profile/ProfileInfo";
import { useQuery } from "@tanstack/react-query";
import type { ProfilesTable } from "@/integrations/supabase/types/profiles";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

export const ProfileSection = () => {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { handleLogout, isLoggingOut } = useAuth();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        toast.error("Error fetching profile");
        return null;
      }

      return data as ProfilesTable["Row"];
    },
    meta: {
      errorBoundary: false
    }
  });

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        toast.error("Error signing out: " + error.message);
        return;
      }
      navigate("/");
      toast.success("Signed out successfully");
    } catch (error: any) {
      console.error("An error occurred while signing out:", error);
      toast.error("An error occurred while signing out");
    } finally {
      setIsLoggingOut(false);
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

  if (isLoading) {
    return (
      <section className="mb-8">
        <Card className="p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="w-20 h-20 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </Card>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-8">
        <Card className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              There was an error loading your profile information. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </Card>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="mb-8">
        <Card className="p-6">
          <p className="text-muted-foreground">Unable to load profile information.</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <ProfileAvatar 
              avatarUrl={profile.avatar_url || ""}
              displayName={profile.display_name || ""}
              username={profile.username || ""}
              profile={profile}
            />
            <ProfileInfo profile={profile} />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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
        </div>
      </Card>
    </section>
  );
};
