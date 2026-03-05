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
      
      <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
        <p className="text-sm font-medium text-gray-900">Admin Dashboard</p>
        <p className="text-xs text-gray-500 mt-1">Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">D</kbd> to access the admin dashboard</p>
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
