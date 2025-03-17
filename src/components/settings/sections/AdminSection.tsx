
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminSectionProps {
  userId?: string;
}

export const AdminSection = ({ userId }: AdminSectionProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

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
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Admin Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Dashboard Access</h3>
            <p className="text-sm text-muted-foreground">
              Access administrative dashboard and controls
            </p>
          </div>
          <Button 
            onClick={handleDashboardClick}
            className="flex items-center gap-2"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Button>
        </div>
      </div>
    </section>
  );
};
