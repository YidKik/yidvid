
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/useIsMobile";

interface AdminSectionProps {
  userId?: string;
}

export const AdminSection = ({ userId }: AdminSectionProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Fetch admin status directly
  const { data: profile, isLoading } = useQuery({
    queryKey: ["admin-section-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      try {
        console.log("Fetching admin status for:", userId);
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching admin status:", error);
          return null;
        }

        console.log("Admin status response:", data);
        return data;
      } catch (error) {
        console.error("Error in admin status query:", error);
        return null;
      }
    },
    enabled: !!userId,
    staleTime: 0, // Don't cache to ensure fresh admin status
  });

  useEffect(() => {
    if (profile) {
      setIsAdmin(profile.is_admin === true);
    }
  }, [profile]);

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  if (isLoading) {
    return <div className="h-4"></div>;
  }

  if (!isAdmin) {
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
