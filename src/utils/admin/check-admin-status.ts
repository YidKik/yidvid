
import { supabase } from "@/integrations/supabase/client";

export const checkAdminStatus = async (): Promise<boolean> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw new Error("Authentication error. Please try signing in again.");
    }
    
    if (!session?.user?.id) {
      throw new Error("You must be signed in to access admin features");
    }

    // Check for secure admin session
    const storedSession = localStorage.getItem('secure-admin-session');
    if (!storedSession) {
      throw new Error("No admin session found");
    }

    let adminSession;
    try {
      adminSession = JSON.parse(storedSession);
      if (new Date(adminSession.expiresAt) <= new Date()) {
        localStorage.removeItem('secure-admin-session');
        throw new Error("Admin session expired");
      }
    } catch {
      localStorage.removeItem('secure-admin-session');
      throw new Error("Invalid admin session");
    }

    // Verify admin session with secure edge function
    const { data: adminCheck, error: adminCheckError } = await supabase.functions.invoke('secure-admin-auth', {
      body: { 
        action: 'verify-admin',
        adminToken: adminSession.adminToken
      }
    });
    
    if (adminCheckError) {
      console.error("Secure admin verification error:", adminCheckError);
      throw new Error("Error verifying admin permissions");
    }
    
    if (!adminCheck?.isAdmin) {
      throw new Error("You don't have admin permissions");
    }
    
    console.log("Admin status confirmed via secure verification");
    return true;
  } catch (error) {
    console.error("Admin check error:", error);
    throw error;
  }
};
