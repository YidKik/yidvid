
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
import { ChannelControl } from "@/components/youtube/ChannelPreferences";
import { useColors } from "@/contexts/ColorContext";
import { PlaybackSettings } from "@/components/settings/PlaybackSettings";
import { ColorSettings } from "@/components/settings/ColorSettings";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { ContactDialog } from "@/components/contact/ContactDialog";
import { MessageSquare, Settings as SettingsIcon } from "lucide-react";

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
      <BackButton />
      <main className="container mx-auto pt-24 px-4 pb-16 max-w-4xl">
        <div className="mb-8 flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="space-y-12">
          {/* Account & Profile Section - Most important personal settings */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-primary/80">Account & Profile</h2>
            <ProfileSection />
          </div>

          {/* Content Preferences - Second most important for user experience */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-primary/80">Content Preferences</h2>
            <PlaybackSettings 
              autoplay={autoplay}
              setAutoplay={setAutoplay}
            />

            <div>
              <h3 className="text-xl font-semibold mb-4">Channel Subscriptions</h3>
              {userId ? (
                <ChannelSubscriptions userId={userId} />
              ) : (
                <Card className="p-6">
                  <p className="text-muted-foreground">Please sign in to manage your subscriptions.</p>
                </Card>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Channel Visibility</h3>
              <Card className="p-6">
                <p className="text-muted-foreground mb-4">
                  Choose which channels you want to see in your feed. Hidden channels won't appear in your recommendations or search results.
                </p>
                <ChannelControl />
              </Card>
            </div>
          </div>

          {/* Activity & History - User's past interactions */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-primary/80">Activity & History</h2>
            <VideoHistorySection />
            <UserAnalyticsSection />
          </div>

          {/* Appearance - Visual customization */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-primary/80">Appearance</h2>
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
          </div>

          {/* Admin Section - Only for admins */}
          {profile?.is_admin && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-primary/80">Admin Controls</h2>
              <Card className="p-6">
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
              </Card>
            </div>
          )}

          {/* Help & Support - Always at the bottom for easy access */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary/80">Help & Support</h2>
            <Card className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <p className="text-muted-foreground">
                  Need help or have suggestions? We're here to assist you.
                </p>
                <ContactDialog />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
