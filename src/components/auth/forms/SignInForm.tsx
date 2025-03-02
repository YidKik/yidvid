
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface SignInFormProps {
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const SignInForm = ({ onOpenChange, isLoading, setIsLoading }: SignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoginError("");
    setIsLoading(true);

    try {
      console.log("Attempting to sign in with email:", email);
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) {
        console.error("Sign in error:", signInError);
        
        // Provide more specific error messages based on the error
        if (signInError.message === "Invalid login credentials") {
          setLoginError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setLoginError(signInError.message || "Error during sign in");
        }
        // Don't show toast error for login issues - show in the form instead
        return;
      }

      if (signInData?.user) {
        console.log("User signed in successfully:", signInData.user.email);
        
        // Clean up all previous profile data and prepare to fetch fresh data
        queryClient.removeQueries({ queryKey: ["profile"] });
        
        // Pre-fetch user profile in background
        queryClient.prefetchQuery({
          queryKey: ["profile", signInData.user.id],
          queryFn: async () => {
            try {
              const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", signInData.user.id)
                .maybeSingle();
              return data;
            } catch (err) {
              console.error("Error prefetching profile:", err);
              return null;
            }
          },
          retry: 2,
        });
        
        toast.success("Signed in successfully!");
        onOpenChange(false);
        navigate("/");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      setLoginError("An unexpected error occurred during sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!email || !password) {
      setLoginError("Please fill in all required fields");
      return false;
    }
    
    if (!email.includes('@')) {
      setLoginError("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      setLoginError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 px-4 border-gray-200 bg-gray-50/50 focus:bg-white transition-all duration-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 px-4 border-gray-200 bg-gray-50/50 focus:bg-white transition-all duration-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
          required
          disabled={isLoading}
          minLength={6}
        />
      </div>
      
      {loginError && (
        <div className="text-sm text-red-500 font-medium p-2 bg-red-50 rounded-lg">
          {loginError}
        </div>
      )}
      
      <button
        type="submit"
        className="w-full h-12 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 shadow-md hover:shadow-lg"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
};
