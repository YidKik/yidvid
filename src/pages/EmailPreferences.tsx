import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EmailPreferences {
  welcome_emails: boolean;
  new_video_emails: boolean;
  general_emails: boolean;
}

export const EmailPreferences = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<EmailPreferences>({
    welcome_emails: true,
    new_video_emails: true,
    general_emails: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unsubscribing, setUnsubscribing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
      return;
    }

    if (user) {
      fetchPreferences();
    }
  }, [user, authLoading, navigate]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('email_preferences')
        .select('welcome_emails, new_video_emails, general_emails')
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;

      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      toast.error("Failed to load email preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('email_preferences')
        .update(preferences)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Email preferences updated successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!user) return;

    try {
      setUnsubscribing(true);
      const { error } = await supabase
        .from('email_preferences')
        .update({
          welcome_emails: false,
          new_video_emails: false,
          general_emails: false,
          unsubscribed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences({
        welcome_emails: false,
        new_video_emails: false,
        general_emails: false,
      });

      toast.success("Unsubscribed from all emails");
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error("Failed to unsubscribe");
    } finally {
      setUnsubscribing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="bg-card rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Email Preferences</h1>
        <p className="text-muted-foreground mb-6">
          Manage which emails you receive from YidVid
        </p>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Welcome Emails</h3>
              <p className="text-sm text-muted-foreground">
                Receive a welcome email when you create your account
              </p>
            </div>
            <Switch
              checked={preferences.welcome_emails}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, welcome_emails: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">New Video Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Get notified when channels you subscribe to upload new videos
              </p>
            </div>
            <Switch
              checked={preferences.new_video_emails}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, new_video_emails: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">General Announcements</h3>
              <p className="text-sm text-muted-foreground">
                Receive updates about new features and site announcements
              </p>
            </div>
            <Switch
              checked={preferences.general_emails}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, general_emails: checked })
              }
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
          <Button
            variant="destructive"
            onClick={handleUnsubscribeAll}
            disabled={unsubscribing}
          >
            {unsubscribing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Unsubscribe from All
          </Button>
        </div>
      </div>
    </div>
  );
};
