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
import { ChannelSubscriptions } from "@/components/youtube/ChannelSubscriptions";

const Settings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize dark mode state from localStorage or system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Effect to handle dark mode changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto pt-24 px-4 pb-16">
        <BackButton />
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        {/* Account Information */}
        <section className="mb-12">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Account Information</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>User ID</Label>
                <code className="bg-muted px-2 py-1 rounded">{userId || 'Loading...'}</code>
              </div>
              <p className="text-sm text-muted-foreground">
                This is your unique identifier in the system. You might need this when requesting admin access.
              </p>
            </div>
          </Card>
        </section>

        {/* Channel Subscriptions Section */}
        <section className="mb-12">
          <Card className="p-6">
            {userId && <ChannelSubscriptions userId={userId} />}
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
