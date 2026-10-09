
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthentication } from "@/hooks/useAuthentication";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  
  const { 
    updatePassword, 
    isLoading,
    error: authError
  } = useAuthentication();
  
  const navigate = useNavigate();

  // Check for auth session
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session for password reset...");
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          console.log("Session exists, user can reset password");
          setCurrentSession(data.session);
          setSessionChecked(true);
          return;
        }
        
        // Give the auth client a moment to process a recovery token in the URL
        const hasToken = /access_token|type=recovery|code=/.test(window.location.hash + window.location.search);
        if (hasToken) {
          await new Promise((r) => setTimeout(r, 1500));
          const retry = await supabase.auth.getSession();
          if (retry.data.session) {
            setCurrentSession(retry.data.session);
            setSessionChecked(true);
            return;
          }
        }
        setLinkInvalid(true);
        setSessionChecked(true);
      } catch (err) {
        console.error("Error in session check:", err);
        setLinkInvalid(true);
        setSessionChecked(true);
      }
    };

    checkSession();
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");

    try {
      await updatePassword(password);
      setSuccess(true);
      toast.success("Password reset successfully! Redirecting to home page...");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(authError?.message || "Failed to reset password");
    }
  };

  const handleRequestNewLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    const email = recoveryEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setRecoveryError("Please enter a valid email address.");
      return;
    }
    setRecoveryLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setRecoveryLoading(false);
    if (error) setRecoveryError(error.message || "Could not send a new link. Please try again.");
    else setRecoverySent(true);
  };

  if (sessionChecked && linkInvalid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-card bg-white p-8 shadow-md">
          <div className="mb-6 text-center">
            <img src="/yidvid-logo-full.png" alt="YidVid Logo" className="h-20 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-foreground">This reset link has expired</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Reset links can only be used once and expire after a while. Enter your email to get a new one.
            </p>
          </div>
          {recoverySent ? (
            <div role="status" className="rounded-card border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              If an account exists for that email, a new reset link is on its way. Check your inbox.
            </div>
          ) : (
            <form onSubmit={handleRequestNewLink} className="space-y-4" noValidate>
              <label htmlFor="recovery-email" className="block text-sm font-medium text-foreground">Email</label>
              <Input
                id="recovery-email"
                type="email"
                autoComplete="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                className="h-12 text-base px-4 text-foreground"
                disabled={recoveryLoading}
              />
              {recoveryError && <p role="alert" className="text-sm text-brand">{recoveryError}</p>}
              <Button type="submit" disabled={recoveryLoading} className="w-full h-12 bg-primary hover:bg-primary-hover text-white">
                {recoveryLoading ? "Sending..." : "Send new reset link"}
              </Button>
            </form>
          )}
          <Button variant="link" type="button" onClick={() => navigate("/videos")} className="mobile-recovery-back h-auto p-0 mt-4 w-full text-sm font-semibold text-brand hover:underline">
            Back to YidVid
          </Button>
        </div>
      </div>
    );
  }

  if (!sessionChecked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-card bg-white p-8 shadow-md text-center">
          <p className="text-muted-foreground">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-card bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <img 
            src="/yidvid-logo-full.png"
            alt="YidVid Logo"
            className="h-20 w-auto mx-auto mb-4 drop-shadow-lg" 
          />
          <h2 className="text-2xl font-semibold text-foreground">Reset Your Password</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Please enter your new password below
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="h-12 text-base px-4 border-border bg-muted focus:bg-white transition-all duration-300 rounded-control focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 shadow-sm text-foreground"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="h-12 text-base px-4 border-border bg-muted focus:bg-white transition-all duration-300 rounded-control focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 shadow-sm text-foreground"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-sm text-brand font-medium p-2 bg-red-50 rounded-card border border-red-100">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base py-0 mt-6 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-card font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 shadow-md hover:shadow-raised"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        ) : (
          <div className="bg-green-50 p-4 rounded-card border border-green-100 text-green-700">
            <p className="font-medium">Password reset successfully!</p>
            <p className="text-sm mt-1">You will be redirected to the home page shortly.</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            Return to Home Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
