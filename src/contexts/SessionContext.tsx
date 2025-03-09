
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  // Important function to preserve content data during auth changes
  const preserveContentData = () => {
    // Save references to content data that should be preserved
    const videosData = queryClient.getQueryData(["youtube_videos"]);
    const channelsData = queryClient.getQueryData(["youtube_channels"]);
    
    // Log what we're preserving
    if (videosData) {
      console.log("Preserving videos data, count:", Array.isArray(videosData) ? videosData.length : 'unknown');
    }
    
    if (channelsData) {
      console.log("Preserving channels data, count:", Array.isArray(channelsData) ? channelsData.length : 'unknown');
    }
    
    // Return a function that will restore this data
    return () => {
      if (videosData) {
        console.log("Restoring videos data, count:", Array.isArray(videosData) ? videosData.length : 'unknown');
        queryClient.setQueryData(["youtube_videos"], videosData);
      }
      
      if (channelsData) {
        console.log("Restoring channels data, count:", Array.isArray(channelsData) ? channelsData.length : 'unknown');
        queryClient.setQueryData(["youtube_channels"], channelsData);
      }
    };
  };

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
        } else {
          console.log("No initial session found");
        }
        
        // Always fetch content data regardless of session status
        fetchInitialContent(queryClient);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing session:", error);
        setSession(null);
        setIsLoading(false);
        
        // Even if there's an error, try to load content
        fetchInitialContent(queryClient);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event);
      
      // Preserve content data before auth changes
      const restoreContent = preserveContentData();
      
      switch (event) {
        case 'SIGNED_IN':
          setSession(currentSession);
          
          // Only invalidate user-specific queries
          queryClient.invalidateQueries({ queryKey: ["profile"] });
          queryClient.invalidateQueries({ queryKey: ["user-profile"] });
          
          // Fetch new profile data
          if (currentSession?.user?.id) {
            prefetchUserData(currentSession, queryClient);
          }
          
          // Restore content data to ensure it's not lost during sign in
          restoreContent();
          break;
          
        case 'TOKEN_REFRESHED':
          setSession(currentSession);
          break;
          
        case 'SIGNED_OUT':
          setSession(null);
          
          // Only invalidate user-specific queries, not content
          queryClient.invalidateQueries({ queryKey: ["profile"] });
          queryClient.invalidateQueries({ queryKey: ["user-profile"] });
          queryClient.invalidateQueries({ queryKey: ["user-video-interactions"] });
          
          // Restore content data
          restoreContent();
          
          // Force a refresh of content data after sign out if no data exists
          if (!queryClient.getQueryData(["youtube_videos"])) {
            console.log("No videos data after sign out, forcing refresh");
            queryClient.invalidateQueries({ queryKey: ["youtube_videos"] });
          }
          
          if (!queryClient.getQueryData(["youtube_channels"])) {
            console.log("No channels data after sign out, forcing refresh");
            queryClient.invalidateQueries({ queryKey: ["youtube_channels"] });
          }
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

// New function to immediately fetch content data on app initialization
function fetchInitialContent(queryClient: any) {
  console.log("Prefetching initial content data for all users");
  
  // Prefetch videos with high priority
  queryClient.prefetchQuery({
    queryKey: ["youtube_videos"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })
          .limit(200);
          
        if (error) {
          console.error("Error prefetching videos:", error);
          return [];
        }
        
        console.log(`Initial content fetch: Got ${data?.length || 0} videos`);
        return data || [];
      } catch (err) {
        console.error("Error in initial video fetch:", err);
        return [];
      }
    },
    staleTime: 30000 // 30 seconds
  });
  
  // Prefetch channels with high priority
  queryClient.prefetchQuery({
    queryKey: ["youtube_channels"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("id, channel_id, title, thumbnail_url")
          .is("deleted_at", null)
          .limit(50);
          
        if (error) {
          console.error("Error prefetching channels:", error);
          return [];
        }
        
        console.log(`Initial content fetch: Got ${data?.length || 0} channels`);
        return data || [];
      } catch (err) {
        console.error("Error in initial channel fetch:", err);
        return [];
      }
    },
    staleTime: 30000 // 30 seconds
  });
}
