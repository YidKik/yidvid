import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface AdminSectionProps {
  userId?: string;
}

export const AdminSection = ({ userId }: AdminSectionProps) => {
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

  // AdminSection is now empty as the dashboard button has been moved
  // We'll return null since there's no content to show
  return null;
};
