import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "@/components/navigation/BackButton";
import { VideoHistorySection } from "@/components/history/VideoHistorySection";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useColors } from "@/contexts/ColorContext";
import { Settings as SettingsIcon, Volume2, Globe, Bell, Shield, Eye } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Existing states
  const [autoplay, setAutoplay] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { colors, updateColors, resetColors } = useColors();
  const [backgroundColor, setBackgroundColor] = useState(colors.backgroundColor);
  const [textColor, setTextColor] = useState(colors.textColor);
  const [buttonColor, setButtonColor] = useState(colors.buttonColor);
  const [logoColor, setLogoColor] = useState(colors.logoColor);

  // New settings states
  const [volume, setVolume] = useState(80);
  const [language, setLanguage] = useState("en");
  const [subtitles, setSubtitles] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState("1");
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [autoHideComments, setAutoHideComments] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [dataCollection, setDataCollection] = useState(true);

  // Save settings to local storage
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify({
      volume,
      language,
      subtitles,
      highContrast,
      playbackSpeed,
      emailNotifications,
      pushNotifications,
      autoHideComments,
      privateAccount,
      dataCollection,
    }));
  }, [volume, language, subtitles, highContrast, playbackSpeed, emailNotifications, 
      pushNotifications, autoHideComments, privateAccount, dataCollection]);

  // Load settings from local storage
  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setVolume(settings.volume ?? 80);
      setLanguage(settings.language ?? 'en');
      setSubtitles(settings.subtitles ?? false);
      setHighContrast(settings.highContrast ?? false);
      setPlaybackSpeed(settings.playbackSpeed ?? '1');
      setEmailNotifications(settings.emailNotifications ?? false);
      setPushNotifications(settings.pushNotifications ?? false);
      setAutoHideComments(settings.autoHideComments ?? false);
      setPrivateAccount(settings.privateAccount ?? false);
      setDataCollection(settings.dataCollection ?? true);
    }
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  const handleDashboardAccess = () => {
    navigate("/dashboard");
  };

  // Effect to sync with ColorContext
  useEffect(() => {
    setBackgroundColor(colors.backgroundColor);
    setTextColor(colors.textColor);
    setButtonColor(colors.buttonColor);
    setLogoColor(colors.logoColor);
  }, [colors]);

  // Check if user is authenticated
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
    await updateColors({
      backgroundColor,
      textColor,
      buttonColor,
      logoColor,
    });
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

  // Query to fetch all profiles for admin management
  const { data: profiles, refetch: refetchProfiles } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      if (!profile?.is_admin) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Error fetching profiles");
        return null;
      }

      return data;
    },
    enabled: !!profile?.is_admin,
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: backgroundColor, color: textColor }}>
      <Header />
      <main className="container mx-auto pt-24 px-4 pb-16">
        <BackButton />
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>

        {/* Color Customization Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Customize Colors</h2>
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      id="backgroundColor"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-20 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm">{backgroundColor}</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      id="textColor"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-20 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm">{textColor}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="buttonColor">Button Color</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      id="buttonColor"
                      value={buttonColor}
                      onChange={(e) => setButtonColor(e.target.value)}
                      className="w-20 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm">{buttonColor}</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="logoColor">Logo Color</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      id="logoColor"
                      value={logoColor}
                      onChange={(e) => setLogoColor(e.target.value)}
                      className="w-20 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm">{logoColor}</span>
                  </div>
                </div>
              </div>

              <div className="col-span-full flex gap-4">
                <Button 
                  onClick={saveColors}
                  variant="default"
                >
                  Save Changes
                </Button>
                <Button 
                  onClick={resetToDefaults}
                  variant="outline"
                >
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Account Information */}
        <section className="mb-12">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Account Information</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>User ID</Label>
                <code className="bg-muted px-2 py-1 rounded">{userId || 'Loading...'}</code>
              </div>
              <p className="text-sm text-muted-foreground">
                This is your unique identifier in the system. You might need this when requesting admin access.
              </p>
              <div className="pt-4 border-t flex gap-4">
                <Button variant="destructive" onClick={handleSignOut}>
                  Sign Out
                </Button>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Accessibility Settings */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Accessibility</h2>
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={setHighContrast}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitles">Subtitles</Label>
              <Switch
                id="subtitles"
                checked={subtitles}
                onCheckedChange={setSubtitles}
              />
            </div>
          </Card>
        </section>

        {/* Video Playback Settings */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Volume2 className="h-6 w-6" />
            Playback Settings
          </h2>
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="volume">Default Volume ({volume}%)</Label>
              <Slider
                id="volume"
                min={0}
                max={100}
                step={1}
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="playback-speed">Default Playback Speed</Label>
              <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
                <SelectTrigger className="w-full bg-background border-input">
                  <SelectValue placeholder="Select speed" />
                </SelectTrigger>
                <SelectContent className="bg-background border-2 border-input shadow-lg">
                  <SelectItem value="0.25" className="hover:bg-accent">0.25x</SelectItem>
                  <SelectItem value="0.5" className="hover:bg-accent">0.5x</SelectItem>
                  <SelectItem value="0.75" className="hover:bg-accent">0.75x</SelectItem>
                  <SelectItem value="1" className="hover:bg-accent">Normal</SelectItem>
                  <SelectItem value="1.25" className="hover:bg-accent">1.25x</SelectItem>
                  <SelectItem value="1.5" className="hover:bg-accent">1.5x</SelectItem>
                  <SelectItem value="2" className="hover:bg-accent">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoplay">Autoplay</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically play next video
                </p>
              </div>
              <Switch
                id="autoplay"
                checked={autoplay}
                onCheckedChange={setAutoplay}
              />
            </div>
          </Card>
        </section>

        {/* Language Settings */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Language Settings
          </h2>
          <Card className="p-6">
            <div className="space-y-2">
              <Label htmlFor="language">Interface Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full bg-background border-input">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-background border-2 border-input shadow-lg">
                  <SelectItem value="en" className="hover:bg-accent">English</SelectItem>
                  <SelectItem value="es" className="hover:bg-accent">Español</SelectItem>
                  <SelectItem value="fr" className="hover:bg-accent">Français</SelectItem>
                  <SelectItem value="de" className="hover:bg-accent">Deutsch</SelectItem>
                  <SelectItem value="it" className="hover:bg-accent">Italiano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </section>

        {/* Notification Settings */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notification Settings
          </h2>
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser notifications
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </Card>
        </section>

        {/* Privacy Settings */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Privacy Settings
          </h2>
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="private-account">Private Account</Label>
                <p className="text-sm text-muted-foreground">
                  Only show your activity to followers
                </p>
              </div>
              <Switch
                id="private-account"
                checked={privateAccount}
                onCheckedChange={setPrivateAccount}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="data-collection">Data Collection</Label>
                <p className="text-sm text-muted-foreground">
                  Allow us to collect usage data to improve your experience
                </p>
              </div>
              <Switch
                id="data-collection"
                checked={dataCollection}
                onCheckedChange={setDataCollection}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-hide-comments">Auto-hide Comments</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically hide comments on videos
                </p>
              </div>
              <Switch
                id="auto-hide-comments"
                checked={autoHideComments}
                onCheckedChange={setAutoHideComments}
              />
            </div>
          </Card>
        </section>

        {/* Admin Section */}
        {profile?.is_admin && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Admin Controls</h2>
            <Card className="p-6">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dashboard Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Access the admin dashboard to manage channels and videos
                    </p>
                  </div>
                  <Button onClick={handleDashboardAccess}>
                    Open Dashboard
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Manage Admins</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Admin Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles?.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>{profile.email}</TableCell>
                          <TableCell>
                            {profile.is_admin ? "Admin" : "User"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant={profile.is_admin ? "destructive" : "default"}
                              onClick={() => toggleAdminStatus(profile.id, !!profile.is_admin)}
                              disabled={profile.id === userId}
                            >
                              {profile.is_admin ? "Remove Admin" : "Make Admin"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
