import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [alreadyUnsubscribed, setAlreadyUnsubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError("Missing unsubscribe token");
      setLoading(false);
      return;
    }

    handleUnsubscribe(token);
  }, [searchParams]);

  const handleUnsubscribe = async (token: string) => {
    try {
      setLoading(true);

      // Find the user with this token
      const { data: preferences, error: findError } = await supabase
        .from('email_preferences')
        .select('user_id, unsubscribed_at')
        .eq('unsubscribe_token', token)
        .single();

      if (findError || !preferences) {
        setError("Invalid unsubscribe token");
        setLoading(false);
        return;
      }

      // Check if already unsubscribed
      if (preferences.unsubscribed_at) {
        setAlreadyUnsubscribed(true);
        setLoading(false);
        return;
      }

      // Unsubscribe
      const { error: updateError } = await supabase
        .from('email_preferences')
        .update({
          welcome_emails: false,
          new_video_emails: false,
          general_emails: false,
          unsubscribed_at: new Date().toISOString()
        })
        .eq('unsubscribe_token', token);

      if (updateError) throw updateError;

      setSuccess(true);
    } catch (err: any) {
      console.error("Unsubscribe error:", err);
      setError(err.message || "Failed to unsubscribe");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Processing your request...</p>
      </div>
    );
  }

  if (alreadyUnsubscribed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Already Unsubscribed</h1>
          <p className="text-muted-foreground mb-6">
            You have already unsubscribed from all YidVid emails.
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            Return to YidVid
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/")} variant="outline" className="w-full">
            Return to YidVid
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Successfully Unsubscribed</h1>
          <p className="text-muted-foreground mb-6">
            You have been unsubscribed from all YidVid emails. We're sorry to see you go!
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            You can always resubscribe in your account settings.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/settings/email-preferences")}
              variant="outline"
              className="flex-1"
            >
              Manage Preferences
            </Button>
            <Button onClick={() => navigate("/")} className="flex-1">
              Return to YidVid
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
