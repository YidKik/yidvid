import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const Settings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Query to check if user is admin
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
      <main className="container mx-auto pt-24 px-4">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="playback">Playback</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            {profile?.is_admin && (
              <TabsTrigger value="admin">Admin</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Theme Settings</h2>
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
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
              <div className="space-y-4">
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
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="playback" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Playback Settings</h2>
              <div className="space-y-4">
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
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
              <div className="space-y-4">
                <Button variant="destructive">Delete Account</Button>
              </div>
            </Card>
          </TabsContent>

          {profile?.is_admin && (
            <TabsContent value="admin" className="space-y-4">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
                <div className="space-y-4">
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
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Your User ID: {userId}</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;