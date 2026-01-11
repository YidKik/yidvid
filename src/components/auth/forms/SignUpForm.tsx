import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { SignUpFormField } from "./SignUpFormField";
import { TermsCheckbox } from "./TermsCheckbox";
import { SocialLoginButtons } from "../SocialLoginButtons";
import { validateSignUpForm } from "@/utils/formValidation";
import { UserPlus } from "lucide-react";

interface SignUpFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onOpenChange?: (open: boolean) => void;
  hideSocialButtons?: boolean;
}

export const SignUpForm = ({ 
  isLoading, 
  setIsLoading, 
  onOpenChange,
  hideSocialButtons = false
}: SignUpFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateSignUpForm(email, password, username);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setIsLoading(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
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

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <SignUpFormField
        type="text"
        placeholder="Username"
        value={username}
        onChange={setUsername}
        disabled={isLoading}
      />
      
      <SignUpFormField
        type="email"
        placeholder="Email"
        value={email}
        onChange={setEmail}
        disabled={isLoading}
      />
      
      <SignUpFormField
        type="password"
        placeholder="Password"
        value={password}
        onChange={setPassword}
        disabled={isLoading}
        minLength={6}
      />
      
      <Button
        type="submit"
        className={`w-full ${isMobile 
          ? 'h-11 text-sm' 
          : 'h-12 text-base'} 
          mt-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-2 border-yellow-500
          rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 
          disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] 
          disabled:hover:scale-100 shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
        style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
        disabled={isLoading}
      >
        <UserPlus size={18} />
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
      
      {!hideSocialButtons && <SocialLoginButtons />}
    </form>
  );
};
