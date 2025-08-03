import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AdminSession {
  adminToken: string;
  expiresAt: string;
}

export const useSecureAdminAuth = () => {
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const navigate = useNavigate();

  // Check for existing admin session on mount
  useEffect(() => {
    const stored = localStorage.getItem('secure-admin-session');
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (new Date(session.expiresAt) > new Date()) {
          setAdminSession(session);
        } else {
          localStorage.removeItem('secure-admin-session');
        }
      } catch {
        localStorage.removeItem('secure-admin-session');
      }
    }
  }, []);

  const handlePinVerification = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('secure-admin-auth', {
        body: { 
          action: 'verify-pin', 
          pin: adminPin.trim()
        }
      });

      if (error) {
        console.error('PIN verification error:', error);
        toast.error("Failed to verify PIN. Please try again.");
        return;
      }

      if (data.success) {
        const session = {
          adminToken: data.adminToken,
          expiresAt: data.expiresAt
        };
        
        setAdminSession(session);
        localStorage.setItem('secure-admin-session', JSON.stringify(session));
        
        toast.success("Admin access granted");
        setShowPinDialog(false);
        setAdminPin("");
        
        // Navigate to dashboard
        setTimeout(() => navigate("/dashboard"), 100);
      } else {
        toast.error(data.error || "Invalid PIN");
        setAdminPin("");
      }
    } catch (error) {
      console.error('PIN verification failed:', error);
      toast.error("Failed to verify PIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkAdminStatus = async (): Promise<boolean> => {
    try {
      if (!adminSession) return false;

      const { data, error } = await supabase.functions.invoke('secure-admin-auth', {
        body: { 
          action: 'verify-admin',
          adminToken: adminSession.adminToken
        }
      });

      if (error) {
        console.error('Admin verification error:', error);
        return false;
      }

      return data.isAdmin || false;
    } catch (error) {
      console.error('Admin status check failed:', error);
      return false;
    }
  };

  const clearAdminSession = () => {
    setAdminSession(null);
    localStorage.removeItem('secure-admin-session');
  };

  return {
    showPinDialog,
    setShowPinDialog,
    adminPin,
    setAdminPin,
    isLoading,
    handlePinVerification,
    checkAdminStatus,
    clearAdminSession,
    hasAdminSession: !!adminSession,
    adminSession
  };
};