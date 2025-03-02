
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const useSessionManager = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          return;
        }

        if (initialSession) {
          console.log("Initial session loaded:", initialSession.user?.email);
          setSession(initialSession);
          
          // Pre-fetch profile data to warm up the cache
          if (initialSession.user?.id) {
            queryClient.prefetchQuery({
              queryKey: ["profile", initialSession.user.id],
              queryFn: async () => {
                try {
                  const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", initialSession.user.id)
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
            });
            
            // Also prefetch for user-profile (used in UserMenu)
            queryClient.prefetchQuery({
              queryKey: ["user-profile"],
              queryFn: async () => {
                try {
                  const { data, error } = await supabase
                    .from("profiles")
                    .select("is_admin")
                    .eq("id", initialSession.user.id)
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
            });
          }
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log("Auth state changed:", event);
          
          switch (event) {
            case 'SIGNED_IN':
              setSession(currentSession);
              
              // Clear previous user data from cache before fetching new data
              if (currentSession?.user?.id) {
                queryClient.removeQueries({ queryKey: ["profile"] });
                queryClient.removeQueries({ queryKey: ["user-profile"] });
                
                // Fetch new profile data
                queryClient.prefetchQuery({
                  queryKey: ["profile", currentSession.user.id],
                  queryFn: async () => {
                    try {
                      const { data, error } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", currentSession.user.id)
                        .maybeSingle();
                      
                      if (error) {
                        console.error("Error prefetching profile:", error);
                        return null;
                      }
                      
                      console.log("Prefetched profile data after sign in:", data);
                      return data;
                    } catch (err) {
                      console.error("Error prefetching profile:", err);
                      return null;
                    }
                  },
                  retry: 1,
                });
                
                // Also prefetch for user-profile (used in UserMenu)
                queryClient.prefetchQuery({
                  queryKey: ["user-profile"],
                  queryFn: async () => {
                    try {
                      const { data, error } = await supabase
                        .from("profiles")
                        .select("is_admin")
                        .eq("id", currentSession.user.id)
                        .single();
                      
                      if (error) {
                        console.error("Error prefetching user profile:", error);
                        return null;
                      }
                      
                      console.log("Prefetched user profile (admin status) after sign in:", data);
                      return data;
                    } catch (err) {
                      console.error("Error prefetching user profile:", err);
                      return null;
                    }
                  },
                  retry: 1,
                });
              }
              break;
              
            case 'TOKEN_REFRESHED':
              setSession(currentSession);
              break;
              
            case 'SIGNED_OUT':
              setSession(null);
              // Clear all user-related queries from cache
              queryClient.clear();
              navigate('/');
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

        return () => subscription?.unsubscribe();
      } catch (error) {
        console.error("Error initializing session:", error);
        setSession(null);
      }
    };

    initializeSession();
  }, [navigate, queryClient]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during logout:", error);
        return;
      }
      setSession(null);
      // Clear all query cache on logout
      queryClient.clear();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      navigate("/");
    }
  };

  return { session, handleLogout };
};
