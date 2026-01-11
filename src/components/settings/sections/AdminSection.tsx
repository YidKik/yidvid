import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AdminPinDialog } from "./admin/AdminPinDialog";
import { AdminDashboardAccess } from "./admin/AdminDashboardAccess";
import { useSecureAdminAuth } from "@/hooks/useSecureAdminAuth";
import { Shield, Key } from "lucide-react";

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
    handlePinVerification,
    checkAdminStatus,
    hasAdminSession
  } = useSecureAdminAuth();

  const { data: cachedAdminStatus } = useQuery({
    queryKey: ["admin-status", userId],
    queryFn: async () => {
      if (userId) {
        const cached = JSON.parse(localStorage.getItem(`admin-status-${userId}`) || 'null');
        if (cached) return cached;
      }
      const hasPinBypass = localStorage.getItem('admin-pin-bypass') === 'true';
      if (hasPinBypass) return { isAdmin: true };
      return null;
    },
    enabled: !!userId,
    staleTime: Infinity,
  });

  const { data: adminStatus } = useQuery({
    queryKey: ["user-admin-status", userId],
    queryFn: async () => {
      if (!userId) return { isAdmin: false };
      if (cachedAdminStatus) return cachedAdminStatus;
      
      const hasPinBypass = localStorage.getItem('admin-pin-bypass') === 'true';
      if (hasPinBypass) return { isAdmin: true };
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", userId)
          .maybeSingle();

        if (error) return { isAdmin: false };
        
        const isAdmin = data?.is_admin === true;
        if (isAdmin) {
          localStorage.setItem(`admin-status-${userId}`, JSON.stringify({ isAdmin: true }));
          return { isAdmin: true };
        }
        return { isAdmin: !!data?.is_admin };
      } catch (error) {
        return { isAdmin: false };
      }
    },
    staleTime: 60000,
    retry: 2,
    enabled: !!userId,
  });

  useEffect(() => {
    setIsLoading(false);
  }, [adminStatus]);

  if (isLoading) return <div className="h-4"></div>;

  return (
    <div style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
        <Shield size={18} className="text-yellow-600" />
        <h2 className="text-lg font-bold text-gray-900">Admin Settings</h2>
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Key size={14} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-800">Dashboard Access</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Access administrative dashboard and controls.
        </p>
        
        <div className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-900">Admin Dashboard</p>
            <p className="text-xs text-gray-500">Manage content and users</p>
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
        onUnlock={handlePinVerification}
      />
    </div>
  );
};
