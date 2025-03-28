import { Session } from "@supabase/supabase-js";
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Prefetches user profile data after authentication with improved reliability
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
          const { data, error } = await supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url, email, is_admin, created_at, updated_at")
            .eq("id", session.user.id)
            .maybeSingle();
          
          if (error) {
            if (!error.message.includes("recursion") && !error.message.includes("policy")) {
              console.error("Error prefetching profile settings:", error);
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
  
  // Prefetch for user-profile (used in various components)
  prefetchPromises.push(
    queryClient.prefetchQuery({
      queryKey: ["user-profile"],
      queryFn: async () => {
        try {
          console.log("Executing user-profile prefetch query");
          const { data, error } = await supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url, email, is_admin, created_at, updated_at")
            .eq("id", session.user.id)
            .single();
          
          if (error) {
            console.error("Error prefetching user profile:", error);
            return null;
          }
          
          console.log("Successfully prefetched user-profile data:", data ? "found" : "not found");
          
          // Log admin status for debugging
          if (data?.is_admin) {
            console.log("User has admin privileges:", data.is_admin);
          }
          
          return data;
        } catch (err) {
          console.error("Unexpected error in user-profile prefetch:", err);
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
  
  // Also prefetch admin-section-profile specifically for admin status
  prefetchPromises.push(
    queryClient.prefetchQuery({
      queryKey: ["admin-section-profile", session.user.id],
      queryFn: async () => {
        try {
          console.log("Prefetching admin status for user:", session.user.id);
          const { data, error } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", session.user.id)
            .single();
          
          if (error) {
            console.error("Error fetching admin status:", error);
            return null;
          }
          
          console.log("Admin status check result:", data);
          return data;
        } catch (err) {
          console.error("Error in admin status query:", err);
          return null;
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
