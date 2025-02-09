
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";

interface AuthFormProps {
  onOpenChange: (open: boolean) => void;
}

export const AuthForm = ({ onOpenChange }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return false;
    }
    
    if (!email.includes('@')) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleSignIn = async () => {
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Sign in error:", signInError);
        toast.error(signInError.message || "Error during sign in");
        return;
      }

      if (signInData?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", signInData.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast.error("Error loading user profile");
          return;
        }

        await queryClient.setQueryData(["profile", signInData.user.id], profileData);
        
        toast.success("Signed in successfully!");
        onOpenChange(false);
        navigate("/");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error("An error occurred during sign in");
    }
  };

  const handleSignUp = async () => {
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error("Sign up error:", signUpError);
        toast.error(signUpError.message || "Error during sign up");
        return;
      }

      if (signUpData?.user) {
        toast.success("Account created successfully! Please check your email to confirm your account.");
        // Note: The profile will be created automatically by the database trigger
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error("An error occurred during sign up");
    }
  };

  const handleSubmit = async (e: React.FormEvent, mode: 'signin' | 'signup') => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await handleSignIn();
      } else {
        await handleSignUp();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchToSignUp = () => {
    const signupTrigger = document.querySelector('[value="signup"]') as HTMLButtonElement;
    if (signupTrigger) signupTrigger.click();
  };

  const switchToSignIn = () => {
    const signinTrigger = document.querySelector('[value="signin"]') as HTMLButtonElement;
    if (signinTrigger) signinTrigger.click();
  };

  return (
    <Tabs defaultValue="signup" className="w-full max-w-sm mx-auto">
      <TabsContent value="signin">
        <form onSubmit={(e) => handleSubmit(e, 'signin')} className="space-y-2 sm:space-y-3">
          <div>
            <Input
              id="signin-email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-input rounded-md h-8 sm:h-10 text-xs sm:text-sm"
              required
              disabled={isLoading}
              aria-label="Email"
            />
          </div>
          <div>
            <Input
              id="signin-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-input rounded-md h-8 sm:h-10 text-xs sm:text-sm"
              required
              disabled={isLoading}
              minLength={6}
              aria-label="Password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white rounded-md py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Sign In"}
          </button>
          <p className="text-[10px] sm:text-xs text-center text-gray-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={switchToSignUp}
              className="text-primary hover:underline focus:outline-none"
            >
              Sign up
            </button>
          </p>
        </form>
      </TabsContent>
      <TabsContent value="signup">
        <form onSubmit={(e) => handleSubmit(e, 'signup')} className="space-y-2 sm:space-y-3">
          <div>
            <Input
              id="signup-email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-input rounded-md h-8 sm:h-10 text-xs sm:text-sm"
              required
              disabled={isLoading}
              aria-label="Email"
            />
          </div>
          <div>
            <Input
              id="signup-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-input rounded-md h-8 sm:h-10 text-xs sm:text-sm"
              required
              disabled={isLoading}
              minLength={6}
              aria-label="Password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white rounded-md py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Sign Up"}
          </button>
          <p className="text-[10px] sm:text-xs text-center text-gray-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={switchToSignIn}
              className="text-primary hover:underline focus:outline-none"
            >
              Sign in
            </button>
          </p>
        </form>
      </TabsContent>
    </Tabs>
  );
};
