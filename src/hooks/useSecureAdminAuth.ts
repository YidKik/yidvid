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
      // Check rate limiting before attempting PIN verification
      const rateLimitCheck = await supabase.functions.invoke('secure-rate-limit', {
        body: {
          identifier: adminPin.trim(), // Use PIN as identifier for admin attempts
          attemptType: 'admin_pin',
          action: 'check'
        }
      });

      if (rateLimitCheck.error || rateLimitCheck.data?.blocked) {
        toast.error(rateLimitCheck.data?.message || "Too many attempts. Please try again later.");
        return;
      }

      const { data, error } = await supabase.functions.invoke('secure-admin-auth', {
        body: { 
          action: 'verify-pin', 
          pin: adminPin.trim()
        }
      });

      if (error) {
        console.error('PIN verification error:', error);
        
        // Log security event and increment rate limit on failure
        await Promise.all([
          supabase.functions.invoke('log-security-event', {
            body: {
              eventType: 'failed_login',
              details: { attemptType: 'admin_pin', error: error.message },
              severity: 'warning'
            }
          }),
          supabase.functions.invoke('secure-rate-limit', {
            body: {
              identifier: adminPin.trim(),
              attemptType: 'admin_pin',
              action: 'increment'
            }
          })
        ]);
        
        toast.error("Failed to verify PIN. Please try again.");
        return;
      }

      if (data.success) {
        // Reset rate limit on successful authentication
        await supabase.functions.invoke('secure-rate-limit', {
          body: {
            identifier: adminPin.trim(),
            attemptType: 'admin_pin',
            action: 'reset'
          }
        });

        // Log successful admin access
        await supabase.functions.invoke('log-security-event', {
          body: {
            eventType: 'admin_access',
            details: { success: true },
            severity: 'info'
          }
        });

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
        // Log failed attempt and increment rate limit
        await Promise.all([
          supabase.functions.invoke('log-security-event', {
            body: {
              eventType: 'failed_login',
              details: { attemptType: 'admin_pin', reason: data.error },
              severity: 'warning'
            }
          }),
          supabase.functions.invoke('secure-rate-limit', {
            body: {
              identifier: adminPin.trim(),
              attemptType: 'admin_pin',
              action: 'increment'
            }
          })
        ]);
        
        toast.error(data.error || "Invalid PIN");
        setAdminPin("");
      }
    } catch (error) {
      console.error('PIN verification failed:', error);
      
      // Log critical security event
      await supabase.functions.invoke('log-security-event', {
        body: {
          eventType: 'suspicious_activity',
          details: { attemptType: 'admin_pin', error: error.message },
          severity: 'critical'
        }
      });
      
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