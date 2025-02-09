import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsContent value="signin">
        <form onSubmit={(e) => handleSubmit(e, 'signin')} className="space-y-3">
          <div>
            <Input
              id="signin-email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-input rounded-md h-9"
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
              className="border border-input rounded-md h-9"
              required
              disabled={isLoading}
              minLength={6}
              aria-label="Password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white rounded-md py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Sign In"}
          </button>
        </form>
      </TabsContent>
      <TabsContent value="signup">
        <form onSubmit={(e) => handleSubmit(e, 'signup')} className="space-y-3">
          <div>
            <Input
              id="signup-email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-input rounded-md h-9"
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
              className="border border-input rounded-md h-9"
              required
              disabled={isLoading}
              minLength={6}
              aria-label="Password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white rounded-md py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Sign Up"}
          </button>
        </form>
      </TabsContent>
      <TabsList className="mt-2 flex w-full justify-between bg-transparent p-0">
        <TabsTrigger value="signin" className="text-xs" />
        <TabsTrigger value="signup" className="text-xs" />
      </TabsList>
    </Tabs>
  );
};
