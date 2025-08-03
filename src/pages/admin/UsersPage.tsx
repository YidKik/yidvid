
import { UserManagementSection } from "@/components/dashboard/UserManagementSection";
import { BackButton } from "@/components/navigation/BackButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Get current user session
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Fetch user admin status using secure server-side validation
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      setCurrentUserId(session.user.id);
      
      try {
        console.log("Checking admin status for:", session.user.id);
        
        // Use secure server-side admin verification
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();
        
        if (error) {
          console.error("Admin check error:", error);
          toast.error("Error checking permissions");
          setIsAdmin(false);
        } else {
          console.log("Admin status result:", data);
          setIsAdmin(data?.is_admin === true);
        }
      } catch (error) {
        console.error("Unexpected error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isSessionLoading) {
      checkAdminStatus();
    }
  }, [session, isSessionLoading]);

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/");
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading || isSessionLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Return to dashboard button for faster navigation
  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <Button 
          variant="outline" 
          onClick={handleBackToDashboard}
          className="flex items-center gap-2"
        >
          Back to Dashboard
        </Button>
      </div>
      <h1 className="text-3xl font-bold">User Management</h1>
      {isAdmin && <UserManagementSection currentUserId={currentUserId} />}
    </div>
  );
}
