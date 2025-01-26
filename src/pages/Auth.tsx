import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AuthProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const Auth = ({ isOpen, onOpenChange }: AuthProps) => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        if (name) {
          const { error } = await supabase
            .from('profiles')
            .update({ name })
            .eq('id', session.user.id);

          if (error) {
            toast.error("Failed to save name");
          }
        }
        onOpenChange(false);
        navigate("/");
      }
      if (event === "USER_UPDATED") {
        const { error } = await supabase.auth.getSession();
        if (error) {
          setErrorMessage(getErrorMessage(error));
        }
      }
      if (event === "SIGNED_OUT") {
        setErrorMessage("");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, onOpenChange, name]);

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.code) {
        case "invalid_credentials":
          return "Invalid email or password. Please check your credentials and try again.";
        case "email_not_confirmed":
          return "Please verify your email address before signing in.";
        case "user_not_found":
          return "No user found with these credentials.";
        case "invalid_grant":
          return "Invalid login credentials.";
        default:
          return error.message;
      }
    }
    return error.message;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to JewTube</DialogTitle>
        </DialogHeader>
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <Button
              variant="ghost"
              className={!isSignUp ? "border-b-2 border-primary" : ""}
              onClick={() => setIsSignUp(false)}
            >
              Sign In
            </Button>
            <Button
              variant="ghost"
              className={isSignUp ? "border-b-2 border-primary" : ""}
              onClick={() => setIsSignUp(true)}
            >
              Sign Up
            </Button>
          </div>
          <div className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-[#E5E5E5] focus:border-[#a8a8a8] focus:ring-0"
                />
              </div>
            )}
            <div className="space-y-4">
              <SupabaseAuth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#FF0000',
                        brandAccent: '#CC0000',
                        defaultButtonBackground: '#000000e6',
                        defaultButtonBackgroundHover: '#222222',
                      },
                    },
                  },
                  className: {
                    container: 'auth-container',
                    button: 'auth-button',
                    anchor: 'auth-link',
                  },
                }}
                providers={[]}
                view={isSignUp ? "sign_up" : "sign_in"}
              />
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <SupabaseAuth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#FF0000',
                        brandAccent: '#CC0000',
                        defaultButtonBackground: '#000000e6',
                        defaultButtonBackgroundHover: '#222222',
                      },
                    },
                  },
                  className: {
                    container: 'auth-container',
                    button: 'auth-button',
                    anchor: 'auth-link',
                  },
                }}
                providers={["google"]}
                view="sign_in"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Auth;