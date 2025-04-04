
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthentication } from "@/hooks/useAuthentication";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  const { 
    updatePassword, 
    isLoading, 
    authError, 
    session, 
    setAuthError 
  } = useAuthentication();
  
  const navigate = useNavigate();

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

    const result = await updatePassword(password);
    
    if (result.success) {
      setSuccess(true);
      toast.success("Password reset successfully! Redirecting to home page...");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } else {
      setError(authError || "Failed to reset password");
    }
  };

  // Check for auth state
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session for password reset...");
        
        if (session) {
          console.log("Session exists, user can reset password");
          setSessionChecked(true);
          return;
        }
        
        console.log("No session found, redirecting to home");
        toast.error("Invalid or expired reset link. Please request a new password reset.");
        navigate("/");
      } catch (err) {
        console.error("Error in session check:", err);
        toast.error("An error occurred. Please try again.");
        navigate("/");
      }
    };

    checkSession();
  }, [navigate, session]);

  if (!sessionChecked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md text-center">
          <p className="text-gray-500">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <img 
            src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png"
            alt="YidVid Logo"
            className="h-16 w-auto mx-auto mb-4 drop-shadow-lg" 
          />
          <h2 className="text-2xl font-semibold text-gray-800">Reset Your Password</h2>
          <p className="text-sm text-gray-500 mt-1">
            Please enter your new password below
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="h-12 text-base px-4 border-[#E9ECEF] bg-[#F8F9FA] focus:bg-white transition-all duration-300 rounded-lg focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 shadow-sm text-gray-800"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="h-12 text-base px-4 border-[#E9ECEF] bg-[#F8F9FA] focus:bg-white transition-all duration-300 rounded-lg focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 shadow-sm text-gray-800"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 font-medium p-2 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base py-0 mt-6 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 shadow-md hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        ) : (
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-green-700">
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
