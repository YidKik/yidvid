
import { Session } from "@supabase/supabase-js";
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Prefetches user profile data after authentication with improved reliability
 * and RLS issue handling
 * @param session The user's session object
 * @param queryClient React Query client to manage cache
 */
export function prefetchUserData(session: Session, queryClient: QueryClient) {
  if (!session?.user?.id) {
    console.log("No session user ID available for prefetching");
    return Promise.resolve(null);
  }
  
  console.log("Prefetching profile data for user:", session.user.id);
  
  const prefetchPromises = [];
  
  // Prefetch profile data with detailed error logging (user-profile-settings)
  prefetchPromises.push(
    queryClient.prefetchQuery({
      queryKey: ["user-profile-settings", session.user.id],
      queryFn: async () => {
        try {
          console.log("Executing profile settings prefetch query for:", session.user.id);
          
          // Use a direct query that minimizes potential RLS issues
          const { data, error } = await supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url, email, is_admin, created_at, updated_at")
            .eq("id", session.user.id)
            .maybeSingle();
          
          if (error) {
            // Don't log recursion errors as they're expected until RLS is fixed
            if (!error.message.includes("recursion") && !error.message.includes("policy")) {
              console.error("Error prefetching profile settings:", error);
            }
            
            // Fallback to a simpler query if the detailed one fails
            const fallbackResult = await supabase
              .from("profiles")
              .select("is_admin")
              .eq("id", session.user.id)
              .maybeSingle();
              
            if (!fallbackResult.error) {
              console.log("Successfully fetched fallback profile data");
              return {
                id: session.user.id,
                email: session.user.email,
                is_admin: fallbackResult.data?.is_admin || false
              };
            }
            
            return null;
          }
          
          console.log("Successfully prefetched profile settings data:", data ? "found" : "not found");
          return data;
        } catch (err) {
          console.error("Unexpected error in profile settings prefetch:", err);
          return null;
        }
      },
      retry: 2,
      staleTime: 60000, // Keep data fresh for 1 minute
      meta: {
        errorBoundary: false,
        suppressToasts: true
      }
    })
  );
  
  // Prefetch basic admin status separately for reliability
  prefetchPromises.push(
    queryClient.prefetchQuery({
      queryKey: ["user-admin-status", session.user.id],
      queryFn: async () => {
        try {
          console.log("Prefetching admin status for user:", session.user.id);
          
          // Simplest possible query to check admin status
          const { data, error } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", session.user.id)
            .maybeSingle();
          
          if (error) {
            console.error("Error fetching admin status:", error);
            return { is_admin: false };
          }
          
          console.log("Admin status check result:", data?.is_admin);
          return { is_admin: data?.is_admin || false };
        } catch (err) {
          console.error("Error in admin status query:", err);
          return { is_admin: false };
        }
      },
      retry: 1,
      staleTime: 0, // Always fetch fresh admin status
      meta: {
        suppressToasts: true
      }
    })
  );
  
  // Return a promise that resolves when all prefetch operations are complete
  return Promise.all(prefetchPromises)
    .then(() => {
      console.log("All profile data prefetching completed successfully");
      return true;
    })
    .catch(error => {
      console.error("Error during profile data prefetching:", error);
      return null;
    });
}
