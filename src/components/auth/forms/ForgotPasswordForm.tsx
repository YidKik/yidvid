
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { validateEmail } from "@/utils/formValidation";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.message || "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error("Password reset error:", error);
        setError(error.message);
      } else {
        setIsSubmitted(true);
        toast.success("Password reset instructions sent to your email");
      }
    } catch (err: any) {
      console.error("Unexpected error during password reset:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isSubmitted ? (
        <>
          <div className="mb-4">
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-800 mb-1`}>
              Reset Your Password
            </h3>
            <p className="text-sm text-gray-500">
              Enter your email address and we'll send you instructions to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${isMobile 
                  ? 'h-10 text-sm' 
                  : 'h-12 text-base'} 
                  px-4 border-[#E9ECEF] bg-[#F8F9FA] focus:bg-white transition-all duration-300 
                  rounded-lg focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 shadow-sm text-gray-800`}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-red-600 font-medium p-2 bg-red-50 rounded-lg border border-red-100`}>
                {error}
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <Button
                type="submit"
                className={`w-full ${isMobile 
                  ? 'h-10 text-sm py-0' 
                  : 'h-12 text-base py-0'} 
                  mt-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg font-medium
                  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed 
                  hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 shadow-md hover:shadow-lg`}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Instructions"}
              </Button>
              
              <Button
                type="button"
                onClick={onBack}
                className={`w-full ${isMobile 
                  ? 'h-10 text-sm py-0' 
                  : 'h-12 text-base py-0'} 
                  bg-transparent text-gray-700 hover:bg-gray-100 rounded-lg font-medium
                  transition-all duration-300 border border-gray-200
                  hover:text-gray-900 active:scale-[0.98]`}
              >
                Back to Sign In
              </Button>
            </div>
          </form>
        </>
      ) : (
        <div className="text-center py-6">
          <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-800 mb-2`}>
            Check Your Email
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            We've sent password reset instructions to<br />
            <span className="font-medium text-gray-800">{email}</span>
          </p>
          <Button
            onClick={onBack}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors"
          >
            Return to Sign In
          </Button>
        </div>
      )}
    </div>
  );
};
