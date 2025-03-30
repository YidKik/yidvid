
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminSectionProps {
  userId?: string;
}

export const AdminSection = ({ userId }: AdminSectionProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  // Direct admin status check to avoid RLS issues
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("AdminSection: Checking admin status for:", userId);
        
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error("AdminSection: Error fetching admin status:", error);
          setIsAdmin(false);
        } else {
          console.log("AdminSection: Admin status result:", data);
          setIsAdmin(data?.is_admin === true);
        }
      } catch (error) {
        console.error("AdminSection: Unexpected error checking admin:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [userId]);

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
