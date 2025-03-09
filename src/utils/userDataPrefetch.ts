
import { Session } from "@supabase/supabase-js";
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Prefetches user profile data after authentication
 */
export function prefetchUserData(session: Session, queryClient: QueryClient) {
  if (!session?.user?.id) return;
  
  // Prefetch profile data
  queryClient.prefetchQuery({
    queryKey: ["profile", session.user.id],
    queryFn: async () => {
      try {
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
        
        return data;
      } catch (err) {
        console.error("Error prefetching profile:", err);
        return null;
      }
    },
    retry: 1,
    meta: {
      errorBoundary: false,
      suppressToasts: true
    }
  });
  
  // Also prefetch for user-profile (used in UserMenu)
  queryClient.prefetchQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();
        
        if (error) {
          if (!error.message.includes("recursion") && !error.message.includes("policy")) {
            console.error("Error prefetching user profile:", error);
          }
          return null;
        }
        
        return data;
      } catch (err) {
        console.error("Error prefetching user profile:", err);
        return null;
      }
    },
    retry: 1,
    meta: {
      errorBoundary: false,
      suppressToasts: true
    }
  });
}
