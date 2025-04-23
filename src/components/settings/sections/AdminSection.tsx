
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AdminSectionProps {
  userId?: string;
}

// Admin PIN for backdoor access
const ADMIN_PIN = "Moshe@4463";

export const AdminSection = ({ userId }: AdminSectionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

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

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const handleUnlockWithPin = () => {
    console.log("Validating PIN:", adminPin, "against expected:", ADMIN_PIN);
    if (adminPin === ADMIN_PIN) {
      // Store admin access in localStorage
      if (userId) {
        localStorage.setItem(`admin-status-${userId}`, JSON.stringify({ isAdmin: true }));
        // Add the PIN bypass flag too for consistent behavior with Dashboard.tsx
        localStorage.setItem(`admin-pin-bypass`, "true");
      }
      toast.success("Admin access granted via PIN");
      setShowPinDialog(false);
      setAdminPin("");
      // Navigate to dashboard with a small delay to allow state updates
      setTimeout(() => navigate("/dashboard"), 100);
    } else {
      toast.error("Incorrect PIN");
      setAdminPin("");
    }
  };

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
          {adminStatus?.isAdmin ? (
            <Button 
              onClick={handleDashboardClick}
              className={`flex items-center gap-2 ${isMobile ? 'py-1 h-8 text-xs' : ''}`}
              size={isMobile ? "sm" : "default"}
            >
              <LayoutDashboard className={`${isMobile ? 'h-3 w-3' : 'h-5 w-5'}`} />
              Dashboard
            </Button>
          ) : (
            <Button 
              onClick={() => setShowPinDialog(true)}
              variant="outline"
              className={`flex items-center gap-2 ${isMobile ? 'py-1 h-8 text-xs' : ''}`}
              size={isMobile ? "sm" : "default"}
            >
              <Lock className={`${isMobile ? 'h-3 w-3' : 'h-5 w-5'}`} />
              Enter PIN
            </Button>
          )}
        </div>
      </div>

      {/* Admin PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Access</DialogTitle>
            <DialogDescription>
              Enter the admin PIN to access the dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Input
              type="password"
              placeholder="Enter PIN"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              maxLength={10}  // Updated maxLength to 10
              className="text-center text-lg tracking-widest"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUnlockWithPin();
                }
              }}
            />
            <Button onClick={handleUnlockWithPin}>Unlock</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
