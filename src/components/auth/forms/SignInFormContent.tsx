
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
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="remember" 
            className="h-4 w-4 text-[#ea384c] rounded border-gray-300 focus:ring-[#ea384c]"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-gray-600">Remember me</label>
        </div>
        <button 
          type="button" 
          onClick={onForgotPassword}
          className="text-sm text-[#ea384c] hover:text-red-700"
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
