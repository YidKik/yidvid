
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/contexts/ColorContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSettingsPageState = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, isAuthenticated, handleLogout, isLoggingOut } = useAuth();
  const userId = session?.user?.id;
  const { colors, updateColors, resetColors } = useColors();
  
  // State for color settings
  const [backgroundColor, setBackgroundColor] = useState(colors.backgroundColor);
  const [textColor, setTextColor] = useState(colors.textColor);
  const [buttonColor, setButtonColor] = useState(colors.buttonColor);
  const [logoColor, setLogoColor] = useState(colors.logoColor);
  
  // State for playback settings
  const [autoplay, setAutoplay] = useState(true);
  
  // State for loading and authentication
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [sectionsReady, setSectionsReady] = useState(false);

  // Debug authentication state
  useEffect(() => {
    console.log("Settings page - Auth state:", { 
      isAuthenticated, 
      userId, 
      email: session?.user?.email || "No email" 
    });
    setAuthChecked(true);
  }, [isAuthenticated, userId, session]);

  // Immediately prefetch profile data when the user ID is available
  useEffect(() => {
    if (userId) {
      setLoadingProfile(true);
      console.log("Prefetching user profile for ID:", userId);
      
      // Force a direct fetch of minimal profile data
      queryClient.prefetchQuery({
        queryKey: ["user-profile-settings", userId],
        queryFn: async () => {
          try {
            const { data, error } = await supabase
              .from("profiles")
              .select("id, username, display_name, avatar_url, email")
              .eq("id", userId)
              .maybeSingle();
            
            if (error) {
              console.log("Profile prefetch error:", error);
              // Just return minimal data on error, don't block UI
              return { id: userId, email: session?.user?.email };
            }
            return data;
          } catch (e) {
            console.error("Profile prefetch error:", e);
            return { id: userId, email: session?.user?.email };
          }
        },
        staleTime: 0, // Force fresh data
      }).finally(() => {
        setLoadingProfile(false);
        
        // Always display other sections after profile loads
        setSectionsReady(true);
      });
    } else {
      setLoadingProfile(false);
      // Always display other sections even if no userId
      setSectionsReady(true);
    }
  }, [userId, queryClient, session]);

  // Enhanced auth check
  useEffect(() => {
    const verifyAuth = async () => {
      if (!authChecked) {
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error fetching session:", error);
            toast.error("Authentication error. Please try logging in again.");
          }
          
          const sessionExists = !!data.session;
          console.log("Initial session check:", sessionExists ? "Authenticated" : "Not authenticated");
          
          if (!sessionExists) {
            console.log("No active session detected");
          }
          
          setAuthChecked(true);
        } catch (err) {
          console.error("Unexpected error checking auth:", err);
          setAuthChecked(true);
        }
      }
    };
    
    verifyAuth();
  }, [navigate, authChecked]);

  // Always check if session is lost during the component lifetime
  useEffect(() => {
    if (!isAuthenticated && session === null && authChecked) {
      console.log("Session lost during component lifetime, but we'll stay on settings page");
    }
  }, [isAuthenticated, session, navigate, authChecked]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAutoplay(settings.autoplay ?? true);
    }
  }, []);

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify({
      autoplay,
    }));
  }, [autoplay]);

  // Sync color state with context
  useEffect(() => {
    setBackgroundColor(colors.backgroundColor);
    setTextColor(colors.textColor);
    setButtonColor(colors.buttonColor);
    setLogoColor(colors.logoColor);
  }, [colors]);

  const resetToDefaults = async () => {
    await resetColors();
  };

  const saveColors = async () => {
    try {
      await updateColors({
        backgroundColor,
        textColor,
        buttonColor,
        logoColor,
      });
    } catch (error) {
      console.error('Error in saveColors:', error);
    }
  };

  // Dashboard navigation handler
  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  return {
    // Auth and user state
    userId,
    session,
    isAuthenticated,
    handleLogout,
    isLoggingOut,
    
    // UI state
    loadingProfile,
    authChecked,
    sectionsReady,
    
    // Settings state
    backgroundColor,
    textColor,
    buttonColor,
    logoColor,
    autoplay,
    
    // Setters
    setBackgroundColor,
    setTextColor,
    setButtonColor,
    setLogoColor,
    setAutoplay,
    
    // Actions
    resetToDefaults,
    saveColors,
    handleDashboardClick
  };
};
