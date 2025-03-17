
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "@/components/navigation/BackButton";
import { useColors } from "@/contexts/ColorContext";
import { Settings as SettingsIcon } from "lucide-react";

// Import section components
import { ContentPreferencesSection } from "@/components/settings/sections/ContentPreferencesSection";
import { ActivitySection } from "@/components/settings/sections/ActivitySection";
import { AppearanceSection } from "@/components/settings/sections/AppearanceSection";
import { AdminSection } from "@/components/settings/sections/AdminSection";
import { SupportSection } from "@/components/settings/sections/SupportSection";
import { AccountSection } from "@/components/settings/sections/AccountSection";
import { ProfileSection } from "@/components/settings/ProfileSection";

const Settings = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const { colors, updateColors, resetColors } = useColors();
  const [backgroundColor, setBackgroundColor] = useState(colors.backgroundColor);
  const [textColor, setTextColor] = useState(colors.textColor);
  const [buttonColor, setButtonColor] = useState(colors.buttonColor);
  const [logoColor, setLogoColor] = useState(colors.logoColor);
  const [autoplay, setAutoplay] = useState(true);

  // Fetch user session first
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          navigate("/auth");
          toast.error("Please sign in to access settings");
          return;
        }
        
        if (!session) {
          navigate("/auth");
          toast.error("Please sign in to access settings");
          return;
        }
        
        setUserId(session.user.id);
        console.log("User ID set in settings:", session.user.id);
      } catch (err) {
        console.error("Unexpected error getting session:", err);
        navigate("/auth");
      }
    };
    
    getSession();
  }, [navigate]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAutoplay(settings.autoplay ?? true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify({
      autoplay,
    }));
  }, [autoplay]);

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

  // Query user profile data with better error handling
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["user-profile-settings", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("No user ID available for profile query");
        return null;
      }

      console.log("Fetching user profile in Settings for:", userId);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching profile in Settings:", error);
          toast.error("Error loading your profile");
          throw error;
        }

        console.log("Profile data loaded successfully:", data);
        return data;
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
        return null;
      }
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 0 // Don't cache profile data
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <BackButton />
          <div className="animate-pulse">
            <div className="h-8 w-56 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-12">
              <div className="h-40 bg-gray-100 rounded"></div>
              <div className="h-60 bg-gray-100 rounded"></div>
              <div className="h-40 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Profile query error:", error);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BackButton />
      <main className="container mx-auto pt-24 px-4 pb-16 max-w-4xl">
        <div className="mb-8 flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="space-y-12">
          <ProfileSection />
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
        </div>
      </main>
    </div>
  );
};

export default Settings;
