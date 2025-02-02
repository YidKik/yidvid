import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Video } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface AuthProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const Auth = ({ isOpen, onOpenChange }: AuthProps) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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

    if (isSignUp && !name) {
      toast.error("Please enter your name");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        });

        if (signUpError) {
          console.error("Signup error:", signUpError);
          if (signUpError.message.includes("User already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
            setIsSignUp(false);
          } else {
            toast.error(signUpError.message || "Error during signup");
          }
          return;
        }

        if (signUpData?.user) {
          toast.success("Account created successfully! Please check your email to confirm your account.");
          onOpenChange(false);
        }
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error("Signin error:", signInError);
          if (signInError.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else if (signInError.message.includes("Email not confirmed")) {
            toast.error("Please check your email to confirm your account before signing in");
          } else {
            toast.error(signInError.message || "Error during sign in");
          }
          return;
        }

        if (signInData?.user) {
          await queryClient.prefetchQuery({
            queryKey: ["profile", signInData.user.id],
            queryFn: async () => {
              const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", signInData.user.id)
                .single();
                
              if (error) throw error;
              return data;
            },
          });

          toast.success("Signed in successfully!");
          onOpenChange(false);
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="text-center">
          <div className="flex flex-col items-center mb-6">
            <Video className="h-12 w-12 text-primary mb-2" />
            <h1 className="text-2xl font-bold text-primary">YidVid</h1>
          </div>
        </DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {isSignUp && (
            <div className="space-y-2">
              <Input
                id="name"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-input rounded-md"
                required
                disabled={isLoading}
                aria-label="Full Name"
              />
            </div>
          )}
          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-input rounded-md"
              required
              disabled={isLoading}
              aria-label="Email"
            />
          </div>
          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-input rounded-md"
              required
              disabled={isLoading}
              minLength={6}
              aria-label="Password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white rounded-md py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
              disabled={isLoading}
            >
              {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Auth;