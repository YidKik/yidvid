import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Video } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AuthError {
  message: string;
  code?: string;
}

const Auth = ({ isOpen, onOpenChange }: AuthProps) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const prefetchUserData = async (userId: string) => {
    // Prefetch profile data
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

    // Prefetch notifications
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

    // Prefetch user preferences
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

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
          },
        });

        if (error) throw error;
        
        // Sign in immediately after sign up
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // Parse the error message from the JSON string in the body
          const errorBody = signInError.message && JSON.parse(signInError.message);
          if (errorBody?.code === "email_not_confirmed") {
            toast({
              title: "Almost there!",
              description: "Your account has been created. You can now sign in.",
            });
            setIsSignUp(false); // Switch to sign in mode
            return;
          }
          throw signInError;
        }

        if (signInData.user) {
          await prefetchUserData(signInData.user.id);
        }

        toast({
          title: "Success!",
          description: "You have been signed up and logged in.",
        });
        onOpenChange(false);
      } else {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Parse the error message from the JSON string in the body
          const errorBody = error.message && JSON.parse(error.message);
          if (errorBody?.code === "email_not_confirmed") {
            toast({
              title: "Welcome back!",
              description: "You can now sign in with your account.",
            });
            return;
          }
          throw error;
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col items-center mb-6">
          <Video className="h-12 w-12 text-primary mb-2" />
          <h1 className="text-2xl font-bold text-primary">Jewish Tube</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {isSignUp && (
            <div className="space-y-2">
              <Input
                id="name"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-input rounded-md"
                required
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
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white rounded-md py-2"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
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