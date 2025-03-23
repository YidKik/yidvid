
import { Session } from "@supabase/supabase-js";
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Prefetches user profile data after authentication
 */
export function prefetchUserData(session: Session, queryClient: QueryClient) {
  if (!session?.user?.id) {
    console.log("No session user ID available for prefetching");
    return;
  }
  
  console.log("Prefetching profile data for user:", session.user.id);
  
  // Prefetch profile data with detailed error logging
  queryClient.prefetchQuery({
    queryKey: ["user-profile-settings", session.user.id],
    queryFn: async () => {
      try {
        console.log("Executing profile prefetch query for:", session.user.id);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        
        if (error) {
          if (!error.message.includes("recursion") && !error.message.includes("policy")) {
            console.error("Error prefetching profile:", error);
          }
          return null;
        }
        
        console.log("Successfully prefetched profile data:", data ? "found" : "not found");
        return data;
      } catch (err) {
        console.error("Unexpected error in profile prefetch:", err);
        return null;
      }
    },
    retry: 2,
    staleTime: 60000, // Keep data fresh for 1 minute
    meta: {
      errorBoundary: false,
      suppressToasts: true
    }
  });
  
  // Also prefetch for user-profile (used in various components)
  queryClient.prefetchQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      try {
        console.log("Executing user-profile prefetch query");
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        if (error) {
          console.error("Error prefetching user profile:", error);
          return null;
        }
        
        console.log("Successfully prefetched user-profile data:", data ? "found" : "not found");
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
  });
}
