
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VideoHistorySection } from "@/components/history/VideoHistorySection";
import { ChannelSubscriptions } from "@/components/youtube/ChannelSubscriptions";
import { UserAnalyticsSection } from "@/components/analytics/UserAnalyticsSection";
import { ChannelControl } from "@/components/youtube/ChannelPreferences";
import { useColors } from "@/contexts/ColorContext";
import { PlaybackSettings } from "@/components/settings/PlaybackSettings";
import { LanguageSettings } from "@/components/settings/LanguageSettings";
import { ColorSettings } from "@/components/settings/ColorSettings";
import { BackButton } from "@/components/navigation/BackButton";

export const ProfileSettings = () => {
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: backgroundColor, color: textColor }}>
      <BackButton />
      <main className="container mx-auto pt-24 px-4 pb-16">
        <PlaybackSettings 
          autoplay={autoplay}
          setAutoplay={setAutoplay}
        />
      </main>
    </div>
  );
};

export default ProfileSettings;
