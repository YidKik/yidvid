
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "@/components/navigation/BackButton";
import { useColors } from "@/contexts/ColorContext";
import { Settings as SettingsIcon } from "lucide-react";

// Import new section components
import { ContentPreferencesSection } from "@/components/settings/sections/ContentPreferencesSection";
import { ActivitySection } from "@/components/settings/sections/ActivitySection";
import { AppearanceSection } from "@/components/settings/sections/AppearanceSection";
import { AdminSection } from "@/components/settings/sections/AdminSection";
import { SupportSection } from "@/components/settings/sections/SupportSection";
import { AccountSection } from "@/components/settings/sections/AccountSection";

const Settings = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const { colors, updateColors, resetColors } = useColors();
  const [backgroundColor, setBackgroundColor] = useState(colors.backgroundColor);
  const [textColor, setTextColor] = useState(colors.textColor);
  const [buttonColor, setButtonColor] = useState(colors.buttonColor);
  const [logoColor, setLogoColor] = useState(colors.logoColor);
  const [autoplay, setAutoplay] = useState(true);

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        toast.error("Please sign in to access settings");
      } else {
        setUserId(session.user.id);
      }
    });
  }, [navigate]);

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

  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        toast.error("Error fetching profile");
        return null;
      }

      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BackButton />
      <main className="container mx-auto pt-24 px-4 pb-16 max-w-4xl">
        <div className="mb-8 flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="space-y-12">
          <AccountSection />
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
          <AdminSection userId={userId} />
          <SupportSection />
        </div>
      </main>
    </div>
  );
};

export default Settings;
