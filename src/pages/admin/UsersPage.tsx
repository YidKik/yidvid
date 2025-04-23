
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
  const [hasPinBypass, setHasPinBypass] = useState(false);

  // Get current user session
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Check for PIN bypass on mount
  useEffect(() => {
    const pinBypass = localStorage.getItem('admin-pin-bypass') === 'true';
    console.log("User Management: PIN bypass check from localStorage:", pinBypass);
    setHasPinBypass(pinBypass);
    
    if (pinBypass) {
      setIsLoading(false);
    }
  }, []);

  // Fetch user admin status using direct query instead of RLS-protected query
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session?.user?.id && !hasPinBypass) {
        setIsLoading(false);
        return;
      }

      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
      }
      
      if (hasPinBypass) {
        console.log("Admin access granted via PIN bypass");
        setIsAdmin(true);
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Checking admin status for:", session.user.id);
        
        // Try to use edge function to bypass RLS issues
        try {
          const { data: adminCheckData, error: funcError } = await supabase.functions.invoke('check-admin-status', {
            body: { userId: session.user.id }
          });
          
          if (!funcError && adminCheckData?.isAdmin) {
            console.log("Admin status confirmed via edge function");
            setIsAdmin(true);
            setIsLoading(false);
            return;
          }
        } catch (edgeFuncError) {
          console.log("Edge function not available, falling back to direct query");
        }
        
        // Use a simpler query without joins to avoid RLS issues
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .maybeSingle();
        
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
  }, [session, isSessionLoading, hasPinBypass]);

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && !isAdmin && !hasPinBypass) {
      toast.error("You don't have permission to access this page");
      navigate("/");
    }
  }, [isAdmin, isLoading, navigate, hasPinBypass]);

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
      {(isAdmin || hasPinBypass) && <UserManagementSection currentUserId={currentUserId} />}
    </div>
  );
}
