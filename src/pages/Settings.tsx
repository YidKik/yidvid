import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BackButton } from "@/components/navigation/BackButton";
import { useColors } from "@/contexts/ColorContext";
import { Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

// Import section components
import { ContentPreferencesSection } from "@/components/settings/sections/ContentPreferencesSection";
import { ActivitySection } from "@/components/settings/sections/ActivitySection";
import { AppearanceSection } from "@/components/settings/sections/AppearanceSection";
import { AdminSection } from "@/components/settings/sections/AdminSection";
import { SupportSection } from "@/components/settings/sections/SupportSection";
import { ProfileSection } from "@/components/settings/ProfileSection";

const Settings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, isAuthenticated } = useAuth();
  const userId = session?.user?.id;
  const { colors, updateColors, resetColors } = useColors();
  const [backgroundColor, setBackgroundColor] = useState(colors.backgroundColor);
  const [textColor, setTextColor] = useState(colors.textColor);
  const [buttonColor, setButtonColor] = useState(colors.buttonColor);
  const [logoColor, setLogoColor] = useState(colors.logoColor);
  const [autoplay, setAutoplay] = useState(true);

  // Check authentication first and prefetch profile data
  useEffect(() => {
    if (!isAuthenticated && session === null) {
      navigate("/auth");
      toast.error("Please sign in to access settings");
    } else if (userId) {
      // Prefetch profile data when component mounts to ensure immediate loading
      queryClient.prefetchQuery({
        queryKey: ["user-profile-settings", userId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();
          
          if (error) throw error;
          return data;
        },
        staleTime: 60000, // Keep data fresh for 1 minute
      });
    }
  }, [isAuthenticated, session, navigate, userId, queryClient]);

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

  if (!isAuthenticated && session === null) {
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
