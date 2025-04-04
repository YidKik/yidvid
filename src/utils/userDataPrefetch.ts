
import { QueryClient, QueryKey } from "@tanstack/react-query";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Prefetches user profile data after authentication
 * Improves user experience by having data ready when needed
 * 
 * @param session - The user's authentication session
 * @param queryClient - The query client instance
 */
export const prefetchUserData = async (
  session: Session | null, 
  queryClient: QueryClient
): Promise<void> => {
  if (!session?.user?.id) return;
  
  const userId = session.user.id;
  
  try {
    // Prefetch user profile
    await queryClient.prefetchQuery({
      queryKey: ["profile", userId],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();
            
          if (error) throw error;
          return data;
        } catch (err) {
          console.error("Error prefetching profile:", err);
          return null;
        }
      },
      staleTime: 60000, // 1 minute
    });
    
    // Prefetch admin status
    await queryClient.prefetchQuery({
      queryKey: ["admin-status", userId],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", userId)
            .single();
            
          if (error) throw error;
          return { 
            isAdmin: !!data.is_admin,
            userId
          };
        } catch (err) {
          console.error("Error prefetching admin status:", err);
          return { isAdmin: false, userId };
        }
      },
      staleTime: 300000, // 5 minutes
    });
  } catch (err) {
    console.error("Error during data prefetch:", err);
  }
};
