import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { SignInFormField } from "./SignInFormField";
import { SignInErrorMessage } from "./SignInErrorMessage";
import { LogIn } from "lucide-react";

interface SignInFormContentProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
  loginError: string;
  handleSignIn: (e: React.FormEvent) => Promise<void>;
  onForgotPassword: () => void;
  hideRememberMe?: boolean;
}

export const SignInFormContent = ({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  loginError,
  handleSignIn,
  onForgotPassword,
  hideRememberMe = false,
}: SignInFormContentProps) => {
  const isMobile = useIsMobile();

  return (
    <form onSubmit={handleSignIn} className={`space-y-${isMobile ? '4' : '5'}`}>
      <SignInFormField
        type="email"
        placeholder="Email"
        value={email}
        onChange={setEmail}
        disabled={isLoading}
      />
      
      <SignInFormField
        type="password"
        placeholder="Password"
        value={password}
        onChange={setPassword}
        disabled={isLoading}
        minLength={6}
      />
      
      <SignInErrorMessage error={loginError} />
      
      <Button
        type="submit"
        className={`w-full ${isMobile 
          ? 'h-11 text-sm' 
          : 'h-12 text-base'} 
          mt-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed 
          hover:scale-[1.01] active:scale-[0.99] disabled:hover:scale-100 
          shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
        style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
        disabled={isLoading}
      >
        <LogIn size={18} />
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
};
