
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface SignUpFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onOpenChange?: (open: boolean) => void;
}

export const SignUpForm = ({ isLoading, setIsLoading, onOpenChange }: SignUpFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

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
        // Directly sign in after successful signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          console.error("Auto sign-in error:", signInError);
          toast.error("Account created but couldn't sign in automatically. Please sign in manually.");
          return;
        }

        toast.success("Welcome to the platform!");
        if (onOpenChange) {
          onOpenChange(false);
        }
        navigate("/");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error("An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!email || !password || !username) {
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

  return (
    <form onSubmit={handleSignUp} className="space-y-3">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={`${isMobile 
            ? 'h-10 text-sm' 
            : 'h-12 text-base'} 
            px-4 border-gray-200 bg-gray-50/30 focus:bg-white transition-all duration-300 
            rounded-lg focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 shadow-sm`}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${isMobile 
            ? 'h-10 text-sm' 
            : 'h-12 text-base'} 
            px-4 border-gray-200 bg-gray-50/30 focus:bg-white transition-all duration-300 
            rounded-lg focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 shadow-sm`}
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
          className={`${isMobile 
            ? 'h-10 text-sm' 
            : 'h-12 text-base'} 
            px-4 border-gray-200 bg-gray-50/30 focus:bg-white transition-all duration-300 
            rounded-lg focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 shadow-sm`}
          required
          disabled={isLoading}
          minLength={6}
        />
      </div>
      <Button
        type="submit"
        variant="outline"
        className={`w-full ${isMobile 
          ? 'h-10 text-sm py-0' 
          : 'h-12 text-base py-0'} 
          mt-2 border-purple-500/50 bg-white text-purple-700 hover:bg-purple-50 hover:border-purple-500
          rounded-lg font-medium transition-all duration-300 disabled:opacity-50 
          disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] 
          disabled:hover:scale-100 shadow-sm hover:shadow-md`}
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
};
