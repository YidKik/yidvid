
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AdminPinDialog } from "./admin/AdminPinDialog";
import { AdminDashboardAccess } from "./admin/AdminDashboardAccess";
import { useAdminPinDialog } from "@/hooks/useAdminPinDialog";

interface AdminSectionProps {
  userId?: string;
}

export const AdminSection = ({ userId }: AdminSectionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile } = useIsMobile();
  const {
    showPinDialog,
    setShowPinDialog,
    adminPin,
    setAdminPin,
    handleUnlockWithPin
  } = useAdminPinDialog(userId);

  // First check if we have cached admin status
  const { data: cachedAdminStatus } = useQuery({
    queryKey: ["admin-status", userId],
    queryFn: async () => {
      // Check localStorage first for quicker access
      if (userId) {
        const cached = JSON.parse(localStorage.getItem(`admin-status-${userId}`) || 'null');
        if (cached) {
          console.log("Using cached admin status from localStorage:", cached);
          return cached;
        }
      }
      
      // Also check for PIN bypass
      const hasPinBypass = localStorage.getItem('admin-pin-bypass') === 'true';
      if (hasPinBypass) {
        console.log("Using PIN bypass for admin access");
        return { isAdmin: true };
      }
      
      return null;
    },
    enabled: !!userId,
    staleTime: Infinity,
  });

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
      
      // Check for PIN bypass
      const hasPinBypass = localStorage.getItem('admin-pin-bypass') === 'true';
      if (hasPinBypass) {
        console.log("Using PIN bypass for admin access");
        return { isAdmin: true };
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
          // Store in localStorage for persistence between refreshes
          localStorage.setItem(`admin-status-${userId}`, JSON.stringify({ isAdmin: true }));
          return { isAdmin: true };
        }
        
        return { isAdmin: !!data?.is_admin };
      } catch (error) {
        console.error("Unexpected error checking admin status:", error);
        return { isAdmin: false };
      }
    },
    staleTime: 60000, // 60 seconds
    retry: 2,
    enabled: !!userId,
  });

  // Set loading state based on query status
  useEffect(() => {
    setIsLoading(false);
  }, [adminStatus]);

  if (isLoading) {
    return <div className="h-4"></div>;
  }

  // Always show the section with PIN option even if user is not admin
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
          <AdminDashboardAccess 
            isAdmin={adminStatus?.isAdmin || false} 
            openPinDialog={() => setShowPinDialog(true)}
            isMobile={isMobile}
          />
        </div>
      </div>

      <AdminPinDialog
        showDialog={showPinDialog}
        setShowDialog={setShowPinDialog}
        pinValue={adminPin}
        setPinValue={setAdminPin}
        onUnlock={handleUnlockWithPin}
      />
    </section>
  );
};
