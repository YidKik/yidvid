
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type SessionContextType = {
  session: Session | null;
  isLoading: boolean;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoading: true,
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setIsLoading(false);
          return;
        }

        if (initialSession) {
          console.log("Initial session loaded:", initialSession.user?.email);
          setSession(initialSession);
          
          // Pre-fetch profile data if we have a session
          prefetchUserData(initialSession, queryClient);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing session:", error);
        setSession(null);
        setIsLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event);
      
      switch (event) {
        case 'SIGNED_IN':
          setSession(currentSession);
          
          // IMPORTANT: Preserve existing content data
          if (currentSession?.user?.id) {
            // Only invalidate user-specific queries
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
            
            // Fetch new profile data
            prefetchUserData(currentSession, queryClient);
          }
          
          // Explicitly preserve content
          const videosData = queryClient.getQueryData(["youtube_videos"]);
          const channelsData = queryClient.getQueryData(["youtube_channels"]);
          
          if (videosData) {
            console.log("Preserving existing videos data during sign in");
            queryClient.setQueryData(["youtube_videos"], videosData);
          }
          
          if (channelsData) {
            console.log("Preserving existing channels data during sign in");
            queryClient.setQueryData(["youtube_channels"], channelsData);
          }
          break;
          
        case 'TOKEN_REFRESHED':
          setSession(currentSession);
          break;
          
        case 'SIGNED_OUT':
          setSession(null);
          // IMPORTANT: Only invalidate user-specific queries, not content
          queryClient.invalidateQueries({ queryKey: ["profile"] });
          queryClient.invalidateQueries({ queryKey: ["user-profile"] });
          queryClient.invalidateQueries({ queryKey: ["user-video-interactions"] });
          
          // Do NOT invalidate content queries like "youtube_videos" or "youtube_channels"
          console.log("Preserving content data during sign out");
          break;
          
        case 'USER_UPDATED':
          setSession(currentSession);
          // Invalidate profile query after user update
          if (currentSession?.user?.id) {
            queryClient.invalidateQueries({ queryKey: ["profile", currentSession.user.id] });
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
          }
          break;
      }
    });

    initializeSession();
    
    return () => subscription?.unsubscribe();
  }, [queryClient]);

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};

// Helper function to prefetch user data
function prefetchUserData(session: Session, queryClient: any) {
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
          console.error("Error prefetching profile:", error);
          return null;
        }
        
        console.log("Prefetched profile data:", data);
        return data;
      } catch (err) {
        console.error("Error prefetching profile:", err);
        return null;
      }
    },
    retry: 1,
    meta: {
      errorBoundary: false
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
          console.error("Error prefetching user profile:", error);
          return null;
        }
        
        console.log("Prefetched user profile (admin status):", data);
        return data;
      } catch (err) {
        console.error("Error prefetching user profile:", err);
        return null;
      }
    },
    retry: 1,
    meta: {
      errorBoundary: false
    }
  });
}
