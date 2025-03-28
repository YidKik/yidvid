
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/useIsMobile";
import { toast } from "sonner";

interface AdminSectionProps {
  userId?: string;
}

export const AdminSection = ({ userId }: AdminSectionProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  // Direct query to check admin status, bypassing cache issues
  const { data: profile, isLoading } = useQuery({
    queryKey: ["admin-section-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      try {
        console.log("AdminSection: Fetching admin status for:", userId);
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching admin status in AdminSection:", error);
          return null;
        }

        console.log("AdminSection: Admin status response:", data);
        return data;
      } catch (error) {
        console.error("Error in admin status query in AdminSection:", error);
        return null;
      }
    },
    enabled: !!userId,
    staleTime: 0, // Don't cache to ensure fresh admin status
    retry: 3, // Retry more times
    refetchOnWindowFocus: true, // Refetch when window is focused
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (userId) {
        try {
          // Direct fetch to double-check admin status
          const { data, error } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", userId)
            .single();
            
          if (error) {
            console.error("Failed to check admin status directly:", error);
            return;
          }
          
          console.log("Direct admin status check:", data);
          setIsAdmin(data?.is_admin === true);
        } catch (err) {
          console.error("Error in direct admin check:", err);
        }
      }
    };
    
    // Run the direct check
    checkAdminStatus();
  }, [userId]);

  useEffect(() => {
    if (profile) {
      const adminStatus = profile.is_admin === true;
      console.log("Setting isAdmin to:", adminStatus, "from profile:", profile);
      setIsAdmin(adminStatus);
    }
  }, [profile]);

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  // Skip rendering entirely if no admin status is available yet or if loading
  if (isLoading) {
    return <div className="h-4"></div>;
  }

  // Skip rendering if definitely not an admin
  if (!isAdmin) {
    console.log("Not rendering AdminSection because user is not an admin");
    return null;
  }

  // Log that we're rendering the admin section
  console.log("Rendering AdminSection for admin user");

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
