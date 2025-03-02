
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface AdminSectionProps {
  userId?: string;
}

export const AdminSection = ({ userId }: AdminSectionProps) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch admin status directly
  const { data: profile } = useQuery({
    queryKey: ["admin-section-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching admin status:", error);
          return null;
        }

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

  if (!isAdmin) return null;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-primary/80">Admin Controls</h2>
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm text-muted-foreground">
              Access the admin dashboard to manage channels and videos
            </p>
          </div>
          <Button onClick={() => navigate("/dashboard")}>
            Open Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};
