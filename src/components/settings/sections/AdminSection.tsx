
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface AdminSectionProps {
  userId?: string;
}

export const AdminSection = ({ userId }: AdminSectionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  // First check if we have cached admin status
  const cachedAdminStatus = useQuery({
    queryKey: ["admin-status", userId],
    queryFn: async () => null, // Just access cache
    enabled: false, // Don't actually run a query
    staleTime: Infinity,
  }).data;

  // Use direct query with minimal fields for better performance
  const { data: adminStatus } = useQuery({
    queryKey: ["user-admin-status", userId],
    queryFn: async () => {
      if (!userId) return { isAdmin: false };
      
      // If we already have cached admin status, use it
      if (cachedAdminStatus) {
        console.log("Using cached admin status:", cachedAdminStatus);
        return cachedAdminStatus;
      }
      
      try {
        console.log("Explicitly checking admin status for user:", userId);
        
        // Simplest possible query to avoid RLS issues
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.warn("Error checking admin status:", error.message);
          return { isAdmin: false };
        }
        
        const isAdmin = data?.is_admin === true;
        console.log("Admin status from direct query:", isAdmin);
        
        // Cache the admin status for future quick access
        if (isAdmin) {
          return { isAdmin: true };
        }
        
        return { isAdmin: !!data?.is_admin };
      } catch (error) {
        console.error("Unexpected error checking admin status:", error);
        return { isAdmin: false };
      }
    },
    staleTime: 30000, // 30 seconds
    retry: 1,
    enabled: !!userId,
  });

  // Set loading state based on query status
  useEffect(() => {
    setIsLoading(false);
  }, [adminStatus]);

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  if (isLoading) {
    return <div className="h-4"></div>;
  }

  if (!adminStatus?.isAdmin) {
    return null;
  }

  return (
    <section className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
      <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold mb-2 md:mb-4`}>Admin Settings</h2>
      <div className={`space-y-3 md:space-y-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`${isMobile ? 'text-sm' : 'font-medium'}`}>Dashboard Access</h3>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              Access administrative dashboard and controls
            </p>
          </div>
          <Button 
            onClick={handleDashboardClick}
            className={`flex items-center gap-2 ${isMobile ? 'py-1 h-8 text-xs' : ''}`}
            size={isMobile ? "sm" : "default"}
          >
            <LayoutDashboard className={`${isMobile ? 'h-3 w-3' : 'h-5 w-5'}`} />
            Dashboard
          </Button>
        </div>
      </div>
    </section>
  );
};
