
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SignUpFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const SignUpForm = ({ isLoading, setIsLoading }: SignUpFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

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
        toast.success("Account created successfully! Please check your email to confirm your account.");
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
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="h-12 px-4 border-gray-200 bg-gray-50/50 focus:bg-white transition-all duration-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
      <button
        type="submit"
        className="w-full h-12 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 shadow-md hover:shadow-lg"
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
};
