
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { VideoHistorySection } from "@/components/history/VideoHistorySection";
import { ChannelSubscriptions } from "@/components/youtube/ChannelSubscriptions";
import { UserAnalyticsSection } from "@/components/analytics/UserAnalyticsSection";
import { ChannelPreferences } from "@/components/youtube/ChannelPreferences";
import { useColors } from "@/contexts/ColorContext";
import { PlaybackSettings } from "@/components/settings/PlaybackSettings";
import { LanguageSettings } from "@/components/settings/LanguageSettings";
import { ColorSettings } from "@/components/settings/ColorSettings";

export const ProfileSettings = () => {
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
      <Header />
      <BackButton />
      <main className="container mx-auto pt-24 px-4 pb-16">
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
      </main>
    </div>
  );
};

export default Settings;
