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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BackButton } from "@/components/navigation/BackButton";

const Settings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Query to check if user is admin and get all profiles
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
      <main className="container mx-auto pt-24 px-4">
        <BackButton />
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        {/* Add User ID Card at the top */}
        <Card className="p-6 mb-8">
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

                  <div className="mt-8">
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
