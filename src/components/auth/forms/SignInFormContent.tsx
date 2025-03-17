
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { SignInFormField } from "./SignInFormField";
import { SignInErrorMessage } from "./SignInErrorMessage";

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
    <form onSubmit={handleSignIn} className={`space-y-${isMobile ? '3' : '4'}`}>
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
      
      <div className="flex justify-end items-center">
        <button 
          type="button" 
          onClick={onForgotPassword}
          className="text-sm text-[#ea384c] hover:text-red-700 bg-[#fff3f3] hover:bg-[#ffe6e6] px-3 py-1.5 rounded-md transition-all duration-200"
        >
          Forgot password?
        </button>
      </div>
      
      <SignInErrorMessage error={loginError} />
      
      <Button
        type="submit"
        className={`w-full ${isMobile 
          ? 'h-10 text-sm py-0' 
          : 'h-12 text-base py-0'} 
          mt-3 bg-[#ea384c] hover:bg-red-700 text-white rounded-lg font-medium
          transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed 
          hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 shadow-md hover:shadow-lg`}
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
};
