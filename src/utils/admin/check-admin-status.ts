
import { supabase } from "@/integrations/supabase/client";

export const checkBasicAdminStatus = async (): Promise<boolean> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw new Error("Authentication error. Please try signing in again.");
    }
    
    if (!session?.user?.id) {
      throw new Error("You must be signed in to access admin features");
    }

    // Check if user has admin role using secure server-side function
    const { data: hasAdminRole, error: roleError } = await supabase
      .rpc('has_role', { _user_id: session.user.id, _role: 'admin' });

    if (roleError) {
      console.error("Error checking admin status:", roleError);
      throw new Error("Error verifying admin permissions");
    }

    if (!hasAdminRole) {
      throw new Error("You don't have admin permissions");
    }

    console.log("Basic admin status confirmed");
    return true;
  } catch (error) {
    console.error("Basic admin check error:", error);
    throw error;
  }
};

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

    // Server-side verification only - no client-side session checks
    const { data: adminCheck, error: adminCheckError } = await supabase.functions.invoke('secure-admin-auth', {
      body: { 
        action: 'verify-admin',
        adminToken: session.user.id // Use user ID for verification
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
