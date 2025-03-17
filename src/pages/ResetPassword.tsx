
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Check if we have a hash fragment in the URL which indicates a reset token
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (!hashParams.get("access_token")) {
      toast.error("Invalid or missing reset token");
      navigate("/");
    }
  }, [navigate]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error("Password update error:", error);
        setError(error.message);
      } else {
        setIsSuccess(true);
        toast.success("Password updated successfully");
        setTimeout(() => navigate("/"), 3000);
      }
    } catch (err: any) {
      console.error("Unexpected error during password reset:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset Complete</h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You will be redirected to the login page.
            </p>
            <Button 
              onClick={() => navigate("/")}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg shadow-md"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Your Password</h2>
        <p className="text-gray-600 mb-6">
          Please enter your new password below
        </p>
        
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
              required
              minLength={6}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
              required
              minLength={6}
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-600 font-medium p-2 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Updating Password..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
