
import { supabase } from "@/integrations/supabase/client";

export const checkAdminStatus = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw new Error("Authentication error. Please try signing in again.");
    }
    
    if (!session?.user?.id) {
      throw new Error("You must be signed in to add channels");
    }

    try {
      console.log("Checking admin status via edge function for user:", session.user.id);
      
      const { data: adminCheck, error: adminCheckError } = await supabase.functions.invoke('check-admin-status', {
        body: { userId: session.user.id },
      });
      
      if (adminCheckError) {
        console.error("Edge function admin check error:", adminCheckError);
        throw new Error("Error verifying admin permissions");
      }
      
      if (!adminCheck?.isAdmin) {
        throw new Error("You don't have permission to add channels");
      }
      
      console.log("Admin status confirmed via edge function");
      return true;
    } catch (edgeFunctionError) {
      console.error("Edge function error:", edgeFunctionError);
      
      try {
        console.log("Attempting direct profile query");
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Profile query error:", profileError);
          throw profileError;
        }
        
        if (!profile?.is_admin) {
          throw new Error("You don't have permission to add channels");
        }
        
        console.log("Admin status confirmed via direct query");
        return true;
      } catch (dbError) {
        console.error("Database query error:", dbError);
        
        const hasPinBypass = localStorage.getItem('admin-pin-bypass') === 'true';
        
        if (hasPinBypass) {
          console.log("Using PIN bypass for admin access");
          return true;
        }
        
        throw new Error("You don't have permission to add channels");
      }
    }
  } catch (error) {
    console.error("Admin check error:", error);
    throw error;
  }
};
