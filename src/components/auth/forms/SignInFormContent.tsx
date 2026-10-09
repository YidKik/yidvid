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
    <form onSubmit={handleSignIn} className="space-y-5">
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
      
      <div className="flex justify-end -mt-2">
        <Button variant="link"
          type="button"
          onClick={onForgotPassword}
          className="mobile-auth-link h-auto p-0 text-sm font-semibold text-brand hover:underline focus:outline-none focus-visible:underline"
        >
          Forgot password?
        </Button>
      </div>

      <SignInErrorMessage error={loginError} />
      
      <Button
        type="submit"
        className={`w-full ${isMobile 
          ? 'h-12 type-label font-semibold' : 'h-12 type-label font-semibold'} 
          mt-2 bg-primary hover:brightness-90 text-white rounded-card font-semibold
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed 
          hover:scale-[1.01] active:scale-[0.99] disabled:hover:scale-100 
          shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 py-4`}
        disabled={isLoading}
      >
        <LogIn size={20} />
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
};
