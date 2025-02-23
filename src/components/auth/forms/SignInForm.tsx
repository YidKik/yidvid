
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
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

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
          toast.error("Invalid email or password. Please check your credentials and try again.");
        } else {
          toast.error(signInError.message || "Error during sign in");
        }
        return;
      }

      if (signInData?.user) {
        console.log("User signed in successfully:", signInData.user.email);
        
        // Fetch user profile after successful sign in
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

        // Update profile data in React Query cache
        await queryClient.setQueryData(["profile", signInData.user.id], profileData);
        
        toast.success("Signed in successfully!");
        onOpenChange(false);
        navigate("/");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error("An unexpected error occurred during sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
