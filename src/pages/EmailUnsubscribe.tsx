import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, MailX } from "lucide-react";

type Status = "loading" | "valid" | "already_unsubscribed" | "invalid" | "success" | "error";

export default function EmailUnsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: anonKey } }
        );
        const data = await res.json();
        if (res.ok && data.valid === true) {
          setStatus("valid");
        } else if (data.reason === "already_unsubscribed") {
          setStatus("already_unsubscribed");
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("invalid");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) {
        setStatus("success");
      } else if (data?.reason === "already_unsubscribed") {
        setStatus("already_unsubscribed");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Validating your request...</p>
          </>
        )}

        {status === "valid" && (
          <>
            <MailX className="h-14 w-14 text-[#FF0000] mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Unsubscribe from emails</h1>
            <p className="text-muted-foreground">
              Are you sure you want to unsubscribe from YidVid emails? You can always re-subscribe later in your settings.
            </p>
            <Button
              onClick={handleUnsubscribe}
              disabled={isProcessing}
              className="bg-[#FF0000] hover:bg-[#CC0000] text-white px-8 py-3"
            >
              {isProcessing ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
              ) : (
                "Confirm Unsubscribe"
              )}
            </Button>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-14 w-14 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">You've been unsubscribed</h1>
            <p className="text-muted-foreground">
              You will no longer receive emails from YidVid. If you change your mind, you can update your preferences in settings.
            </p>
            <a href="https://yidvid.com" className="text-[#FF0000] hover:underline text-sm">
              Return to YidVid →
            </a>
          </>
        )}

        {status === "already_unsubscribed" && (
          <>
            <CheckCircle className="h-14 w-14 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Already unsubscribed</h1>
            <p className="text-muted-foreground">
              You've already been unsubscribed from YidVid emails.
            </p>
          </>
        )}

        {status === "invalid" && (
          <>
            <XCircle className="h-14 w-14 text-red-400 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Invalid link</h1>
            <p className="text-muted-foreground">
              This unsubscribe link is invalid or has expired.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-14 w-14 text-red-400 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground">
              We couldn't process your request. Please try again later.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
