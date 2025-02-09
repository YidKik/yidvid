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
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const validateForm = (mode: 'signin' | 'signup') => {
    if (!email || !password || (mode === 'signup' && !username)) {
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
        options: {
          data: {
            username
          }
        }
      });

      if (signUpError) {
        console.error("Sign up error:", signUpError);
        toast.error(signUpError.message || "Error during sign up");
        return;
      }

      if (signUpData?.user) {
        toast.success("Account created successfully! Please check your email to confirm your account.");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error("An error occurred during sign up");
    }
  };

  const handleSubmit = async (e: React.FormEvent, mode: 'signin' | 'signup') => {
    e.preventDefault();
    
    if (!validateForm(mode)) {
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
      <div className="px-8 pt-4">
        <TabsList className="w-full grid grid-cols-2 h-12 bg-gray-100 p-1.5 rounded-xl gap-3">
          <TabsTrigger 
            value="signin" 
            className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
          >
            Sign In
          </TabsTrigger>
          <TabsTrigger 
            value="signup"
            className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
          >
            Sign Up
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="p-8 pt-6">
        <TabsContent value="signin">
          <form onSubmit={(e) => handleSubmit(e, 'signin')} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 px-4 border-gray-200"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 px-4 border-gray-200"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={(e) => handleSubmit(e, 'signup')} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 px-4 border-gray-200"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 px-4 border-gray-200"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 px-4 border-gray-200"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </TabsContent>
      </div>
    </Tabs>
  );
};
