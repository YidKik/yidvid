import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Video } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validateForm = () => {
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }
    
    if (!email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return false;
    }

    if (isSignUp && !name) {
      toast({
        title: "Missing name",
        description: "Please enter your name",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const prefetchUserData = async (userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ["profile", userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        return data;
      },
    });

    await queryClient.prefetchQuery({
      queryKey: ["notifications", userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("video_notifications")
          .select(`
            *,
            youtube_videos (
              id,
              title,
              channel_name,
              thumbnail
            )
          `)
          .eq("user_id", userId)
          .eq("is_read", false)
          .order("created_at", { ascending: false });
        return data;
      },
    });

    await queryClient.prefetchQuery({
      queryKey: ["user_preferences", userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        return data;
      },
    });
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
              avatar_url: null,
            },
          },
        });

        if (signUpError) {
          console.error("Sign up error:", signUpError);
          if (signUpError.message.includes("User already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
            setIsSignUp(false);
            return;
          }
          throw signUpError;
        }
        
        // Sign in immediately after sign up
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error("Auto sign in error after signup:", signInError);
          if (signInError.message.includes("Email not confirmed")) {
            toast({
              title: "Almost there!",
              description: "Please check your email to confirm your account before signing in.",
            });
            setIsSignUp(false);
            return;
          }
          throw signInError;
        }

        if (signInData.user) {
          // Update the profile with the name
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ name: name })
            .eq("id", signInData.user.id);

          if (profileError) {
            console.error("Error updating profile:", profileError);
          }

          await prefetchUserData(signInData.user.id);
        }

        toast({
          title: "Success!",
          description: "You have been signed up and logged in.",
        });
        onOpenChange(false);
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error("Sign in error:", signInError);
          let errorMessage = "Please check your email and password and try again.";
          
          if (signInError.message.includes("Invalid login credentials")) {
            errorMessage = "Invalid email or password. Please try again.";
          } else if (signInError.message.includes("Email not confirmed")) {
            errorMessage = "Please check your email to confirm your account before signing in.";
          }
          
          toast({
            title: "Sign in failed",
            description: errorMessage,
            variant: "destructive",
          });
          return;
        }

        if (signInData.user) {
          await prefetchUserData(signInData.user.id);
        }

        toast({
          title: "Success!",
          description: "You have been signed in.",
        });
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication.",
        variant: "destructive",
      });
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
            <h1 className="text-2xl font-bold text-primary">Jewish Tube</h1>
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
