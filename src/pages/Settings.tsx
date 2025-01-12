import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

  const [autoplay, setAutoplay] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Color customization states
  const [backgroundColor, setBackgroundColor] = useState('#F2FCE2'); // Light green default
  const [textColor, setTextColor] = useState('#1A1F2C'); // Dark purple default
  const [buttonColor, setButtonColor] = useState('#9b87f5'); // Primary purple default
  const [logoColor, setLogoColor] = useState('#221F26'); // Dark charcoal default

  // Effect to apply color changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--background-custom', backgroundColor);
    root.style.setProperty('--text-custom', textColor);
    root.style.setProperty('--button-custom', buttonColor);
    root.style.setProperty('--logo-custom', logoColor);

    // Save colors to localStorage
    localStorage.setItem('customColors', JSON.stringify({
      background: backgroundColor,
      text: textColor,
      button: buttonColor,
      logo: logoColor,
    }));
  }, [backgroundColor, textColor, buttonColor, logoColor]);

  // Load saved colors on mount
  useEffect(() => {
    const savedColors = localStorage.getItem('customColors');
    if (savedColors) {
      const colors = JSON.parse(savedColors);
      setBackgroundColor(colors.background);
      setTextColor(colors.text);
      setButtonColor(colors.button);
      setLogoColor(colors.logo);
    }
  }, []);

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

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: !currentStatus })
      .eq("id", userId);

    if (error) {
      toast.error("Error updating admin status");
    } else {
      toast.success(`Admin status ${currentStatus ? "removed" : "granted"} successfully`);
      refetchProfiles();
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        toast.error("Please sign in to access settings");
      }
    });
  }, [navigate]);

  const handleDashboardAccess = () => {
    navigate("/dashboard");
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: backgroundColor, color: textColor }}>
      <Header />
      <main className="container mx-auto pt-24 px-4 pb-16">
        <BackButton />
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
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
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose a light color for better readability
                  </p>
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

              <div className="col-span-full">
                <Button 
                  onClick={() => {
                    setBackgroundColor('#F2FCE2');
                    setTextColor('#1A1F2C');
                    setButtonColor('#9b87f5');
                    setLogoColor('#221F26');
                  }}
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

        {/* Appearance Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Appearance</h2>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable dark mode for a better viewing experience at night
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </Card>
        </section>

        {/* Notifications Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications about new videos
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </Card>
        </section>

        {/* Playback Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Playback</h2>
          <Card className="p-6">
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

        {/* Privacy Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Privacy</h2>
          <Card className="p-6">
            <Button variant="destructive">Delete Account</Button>
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
