
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/navigation/BackButton";
import { useColors } from "@/contexts/ColorContext";
import { Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

// Import section components
import { ContentPreferencesSection } from "@/components/settings/sections/ContentPreferencesSection";
import { ActivitySection } from "@/components/settings/sections/ActivitySection";
import { AppearanceSection } from "@/components/settings/sections/AppearanceSection";
import { AdminSection } from "@/components/settings/sections/AdminSection";
import { SupportSection } from "@/components/settings/sections/SupportSection";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { ProfileSectionSkeleton } from "@/components/settings/profile/ProfileSectionSkeleton";

const Settings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, isAuthenticated, handleLogout, isLoggingOut } = useAuth();
  const userId = session?.user?.id;
  const { colors, updateColors, resetColors } = useColors();
  const [backgroundColor, setBackgroundColor] = useState(colors.backgroundColor);
  const [textColor, setTextColor] = useState(colors.textColor);
  const [buttonColor, setButtonColor] = useState(colors.buttonColor);
  const [logoColor, setLogoColor] = useState(colors.logoColor);
  const [autoplay, setAutoplay] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [otherSectionsLoaded, setOtherSectionsLoaded] = useState(false);
  const { isMobile } = useIsMobile();
  const [authChecked, setAuthChecked] = useState(false);

  // Immediately prefetch profile data - top priority
  useEffect(() => {
    if (userId) {
      setLoadingProfile(true);
      
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
        
        // Delay loading other sections to prioritize profile
        setTimeout(() => {
          setOtherSectionsLoaded(true);
        }, 100);
      });
    } else {
      setLoadingProfile(false);
    }
  }, [userId, queryClient, session]);

  // Check authentication and redirect as needed - but don't show auth dialog automatically
  useEffect(() => {
    // Only check authentication status once
    if (!authChecked) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          // User is definitely not authenticated, redirect to home page
          navigate("/");
        }
        setAuthChecked(true); 
      });
    }
  }, [navigate, authChecked]);

  // Always check if session is lost during the component lifetime
  useEffect(() => {
    if (!isAuthenticated && session === null && authChecked) {
      navigate("/");
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

  // Show skeleton loading until we confirm login status
  if (!authChecked || (!isAuthenticated && session === null)) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <BackButton />
          <div className="animate-pulse">
            <div className="h-8 w-56 bg-gray-200 rounded mb-8"></div>
            <ProfileSectionSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BackButton />
      <main className={`container mx-auto ${isMobile ? 'pt-14 px-4 md:px-6 max-w-[95%]' : 'pt-24 px-4'} pb-16 max-w-4xl`}>
        <div className={`mb-3 md:mb-8 flex items-center gap-2`}>
          <SettingsIcon className={`${isMobile ? 'w-5 h-5' : 'w-8 h-8'} text-primary`} />
          <h1 className={`${isMobile ? 'text-lg' : 'text-3xl'} font-bold`}>Settings</h1>
        </div>

        <div className="space-y-4 md:space-y-12">
          {/* Profile section always shows first, either real or skeleton */}
          {loadingProfile ? <ProfileSectionSkeleton /> : <ProfileSection />}
          
          {/* Other sections only load after profile is ready */}
          {otherSectionsLoaded && (
            <>
              <ContentPreferencesSection 
                userId={userId}
                autoplay={autoplay}
                setAutoplay={setAutoplay}
              />
              <ActivitySection />
              <AppearanceSection 
                backgroundColor={backgroundColor}
                setBackgroundColor={setBackgroundColor}
                textColor={textColor}
                setTextColor={setTextColor}
                buttonColor={buttonColor}
                setButtonColor={setButtonColor}
                logoColor={logoColor}
                setLogoColor={setLogoColor}
                saveColors={saveColors}
                resetToDefaults={resetToDefaults}
              />
              {userId && <AdminSection userId={userId} />}
              <SupportSection />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;
