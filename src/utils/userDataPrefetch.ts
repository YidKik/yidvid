
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
    queryKey: ["profile", session.user.id],
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
    meta: {
      errorBoundary: false,
      suppressToasts: true
    }
  });
  
  // Prefetch admin status specifically
  queryClient.prefetchQuery({
    queryKey: ["admin-section-profile", session.user.id],
    queryFn: async () => {
      try {
        console.log("Executing admin status prefetch query");
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();
        
        if (error) {
          console.error("Error prefetching admin status:", error);
          return null;
        }
        
        console.log("Successfully prefetched admin status:", data);
        return data;
      } catch (err) {
        console.error("Unexpected error in admin status prefetch:", err);
        return null;
      }
    },
    retry: 2,
    meta: {
      errorBoundary: false,
      suppressToasts: true
    }
  });
}
