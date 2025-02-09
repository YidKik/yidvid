
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "@/components/navigation/BackButton";
import { VideoHistorySection } from "@/components/history/VideoHistorySection";
import { ChannelSubscriptions } from "@/components/youtube/ChannelSubscriptions";
import { UserAnalyticsSection } from "@/components/analytics/UserAnalyticsSection";
import { ChannelPreferences } from "@/components/youtube/ChannelPreferences";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { useColors } from "@/contexts/ColorContext";
import { PlaybackSettings } from "@/components/settings/PlaybackSettings";
import { LanguageSettings } from "@/components/settings/LanguageSettings";
import { ColorSettings } from "@/components/settings/ColorSettings";

const Settings = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const { colors, updateColors, resetColors } = useColors();
  const [backgroundColor, setBackgroundColor] = useState(colors.backgroundColor);
  const [textColor, setTextColor] = useState(colors.textColor);
  const [buttonColor, setButtonColor] = useState(colors.buttonColor);
  const [logoColor, setLogoColor] = useState(colors.logoColor);

  const [volume, setVolume] = useState(80);
  const [language, setLanguage] = useState("en");
  const [autoplay, setAutoplay] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState("1");

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify({
      volume,
      language,
      playbackSpeed,
      autoplay,
    }));
  }, [volume, language, playbackSpeed, autoplay]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setVolume(settings.volume ?? 80);
      setLanguage(settings.language ?? 'en');
      setPlaybackSpeed(settings.playbackSpeed ?? '1');
      setAutoplay(settings.autoplay ?? true);
    }
  }, []);

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

      setUserId(session.user.id);

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
    <div className="min-h-screen" style={{ backgroundColor: backgroundColor, color: textColor }}>
      <Header />
      <BackButton />
      <main className="container mx-auto pt-24 px-4 pb-16">
        <section className="mb-12">
          <ProfileSettings />
        </section>

        <section className="mb-12">
          <VideoHistorySection />
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Channel Subscriptions</h2>
          <Card className="p-6">
            {userId ? (
              <ChannelSubscriptions userId={userId} />
            ) : (
              <p className="text-muted-foreground">Please sign in to manage your subscriptions.</p>
            )}
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Channel Preferences</h2>
          <p className="text-muted-foreground mb-4">
            Choose which channels you want to see in your feed. Hidden channels won't appear in your recommendations or search results.
          </p>
          <ChannelPreferences />
        </section>

        <PlaybackSettings 
          volume={volume}
          setVolume={setVolume}
          autoplay={autoplay}
          setAutoplay={setAutoplay}
          playbackSpeed={playbackSpeed}
          setPlaybackSpeed={setPlaybackSpeed}
        />

        <LanguageSettings 
          userId={userId}
          language={language}
          setLanguage={setLanguage}
        />

        <ColorSettings 
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

        <UserAnalyticsSection />

        {profile?.is_admin && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Admin Controls</h2>
            <Card className="p-6">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm text-muted-foreground">
                      Access the admin dashboard to manage channels and videos
                    </p>
                  </div>
                  <Button onClick={() => navigate("/dashboard")}>
                    Open Dashboard
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
};

export default Settings;
