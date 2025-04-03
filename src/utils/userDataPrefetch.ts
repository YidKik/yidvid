
import { Session } from "@supabase/supabase-js";
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Prefetches user profile data after authentication with improved reliability
 * and RLS issue handling
 * @param session The user's session object
 * @param queryClient React Query client to manage cache
 */
export function prefetchUserData(session: Session, queryClient: QueryClient): Promise<boolean> {
  if (!session?.user?.id) {
    console.log("No session user ID available for prefetching");
    return Promise.resolve(false);
  }
  
  console.log("Prefetching profile data for user:", session.user.id);
  
  // Create a single prefetch Promise that won't fail the whole operation
  return new Promise((resolve) => {
    // Direct query approach - simpler query to avoid RLS issues
    queryClient.prefetchQuery({
      queryKey: ["user-profile-minimal", session.user.id],
      queryFn: async () => {
        try {
          // Use the simplest possible query to avoid RLS recursion
          const { data, error } = await supabase
            .from("profiles")
            .select("id, email, is_admin")
            .eq("id", session.user.id)
            .maybeSingle();
          
          if (error) {
            console.warn("Simple profile fetch failed:", error.message);
            // Return minimal data from session as fallback
            return {
              id: session.user.id,
              email: session.user.email,
              is_admin: false
            };
          }
          
          console.log("Admin status fetch result:", data?.is_admin);
          
          // Cache admin status specifically for quick access
          if (data?.is_admin === true) {
            queryClient.setQueryData(
              ["admin-status", session.user.id],
              { isAdmin: true }
            );
          }
          
          return data;
        } catch (err) {
          console.error("Error in minimal profile fetch:", err);
          // Return minimal data from session as fallback
          return {
            id: session.user.id,
            email: session.user.email,
            is_admin: false
          };
        }
      },
      staleTime: 10000, // 10 seconds
      retry: 1,
      meta: {
        suppressToasts: true
      }
    })
    .then(() => {
      // Only attempt full profile fetch if minimal one succeeded
      setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: ["user-profile-settings", session.user.id],
          queryFn: async () => {
            try {
              // Attempt to get full profile data but don't block on it
              const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .maybeSingle();
              
              // Also cache the admin status from the full profile data
              if (data?.is_admin === true) {
                queryClient.setQueryData(
                  ["admin-status", session.user.id],
                  { isAdmin: true }
                );
              }
              
              return data || {
                id: session.user.id,
                email: session.user.email,
                is_admin: false
              };
            } catch (err) {
              // Just log error and rely on minimal data
              console.warn("Full profile fetch failed:", err);
              return null;
            }
          },
          staleTime: 10000,
          retry: 0,
          meta: {
            suppressToasts: true
          }
        });
      }, 500); // Delay full fetch to prioritize minimal data
      
      resolve(true);
    })
    .catch(err => {
      console.error("Critical error in profile prefetch:", err);
      resolve(false);
    });
  });
}
