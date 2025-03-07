
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

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
  const isMobile = useIsMobile();

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
        
        if (signInError.message === "Invalid login credentials") {
          setLoginError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setLoginError(signInError.message || "Error during sign in");
        }
        setIsLoading(false);
        return;
      }

      if (signInData?.user) {
        console.log("User signed in successfully:", signInData.user.email);
        
        queryClient.removeQueries({ queryKey: ["profile"] });
        queryClient.removeQueries({ queryKey: ["user-profile"] });
        
        // Set the session first, then try to prefetch profiles in the background
        try {
          queryClient.prefetchQuery({
            queryKey: ["profile", signInData.user.id],
            queryFn: async () => {
              try {
                const { data, error } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", signInData.user.id)
                  .maybeSingle();
                  
                if (error) {
                  console.error("Error prefetching profile:", error);
                  return null;
                }
                
                console.log("Prefetched profile after sign in:", data);
                return data;
              } catch (err) {
                console.error("Error prefetching profile:", err);
                return null;
              }
            },
            retry: 1,
            meta: {
              errorBoundary: false
            }
          });
          
          queryClient.prefetchQuery({
            queryKey: ["user-profile"],
            queryFn: async () => {
              try {
                const { data, error } = await supabase
                  .from("profiles")
                  .select("is_admin")
                  .eq("id", signInData.user.id)
                  .single();
                  
                if (error) {
                  console.error("Error prefetching user-profile:", error);
                  return null;
                }
                
                console.log("Prefetched user-profile after sign in:", data);
                return data;
              } catch (err) {
                console.error("Error prefetching user-profile:", err);
                return null;
              }
            },
            retry: 1,
            meta: {
              errorBoundary: false
            }
          });
        } catch (err) {
          console.error("Failed to prefetch profile data:", err);
          // Don't block authentication if profile fetching fails
        }
        
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
    <form onSubmit={handleSignIn} className={`space-y-${isMobile ? '3' : '4'}`}>
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
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${isMobile 
            ? 'h-10 text-sm' 
            : 'h-12 text-base'} 
            px-4 border-[#E9ECEF] bg-[#F8F9FA] focus:bg-white transition-all duration-300 
            rounded-lg focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 shadow-sm text-gray-800`}
          required
          disabled={isLoading}
          minLength={6}
        />
      </div>
      
      {loginError && (
        <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-red-600 font-medium p-2 bg-red-50 rounded-lg border border-red-100`}>
          {loginError}
        </div>
      )}
      
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
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
};
