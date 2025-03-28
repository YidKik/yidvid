
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
import { LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error signing out");
        return;
      }
      navigate("/");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("An error occurred while signing out");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (confirmDelete) {
      try {
        const { error } = await supabase.rpc('delete_user', {});
        if (error) {
          toast.error("Error deleting account");
          return;
        }
        await supabase.auth.signOut();
        navigate("/");
        toast.success("Account deleted successfully");
      } catch (error) {
        toast.error("An error occurred while deleting your account");
      }
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

        <ColorSettings
          backgroundColor={backgroundColor}
          textColor={textColor}
          buttonColor={buttonColor}
          logoColor={logoColor}
          setBackgroundColor={setBackgroundColor}
          setTextColor={setTextColor}
          setButtonColor={setButtonColor}
          setLogoColor={setLogoColor}
          resetToDefaults={resetToDefaults}
          saveColors={saveColors}
        />

        <section className="mt-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Account Actions</h2>
            <div className="space-y-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-6 text-gray-700 hover:text-gray-900 border-2 hover:border-gray-300 transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </Button>
              
              <Button
                onClick={handleDeleteAccount}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-6 text-red-600 hover:text-red-700 border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
              >
                <Trash2 className="h-5 w-5" />
                <span className="font-medium">Delete Account</span>
              </Button>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default ProfileSettings;
