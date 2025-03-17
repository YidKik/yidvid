
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "./forms/SignInForm";
import { SignUpForm } from "./forms/SignUpForm";
import { useIsMobile } from "@/hooks/use-mobile";

interface AuthFormProps {
  onOpenChange: (open: boolean) => void;
  initialTab?: 'signin' | 'signup';
}

export const AuthForm = ({ onOpenChange, initialTab = 'signin' }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <Tabs defaultValue={initialTab} className="w-full">
      <div className={`${isMobile ? 'px-4 pt-3' : 'px-10 pt-8'} bg-transparent`}>
        <TabsList className={`w-full grid grid-cols-2 ${isMobile 
          ? 'h-9 bg-black/30 p-1 rounded-lg gap-1 shadow-none' 
          : 'h-14 bg-black/20 p-1 rounded-xl gap-4 shadow-sm'}`}
        >
          <TabsTrigger 
            value="signin" 
            className={`rounded-md ${isMobile 
              ? 'text-xs font-medium py-1 transition-all' 
              : 'text-lg font-medium py-1'} 
              text-gray-300 data-[state=active]:bg-white/10 data-[state=active]:text-white 
              data-[state=active]:shadow-md data-[state=active]:scale-[1.02] data-[state=active]:font-semibold 
              transition-all duration-200 hover:bg-white/10`}
          >
            Sign In
          </TabsTrigger>
          <TabsTrigger 
            value="signup"
            className={`rounded-md ${isMobile 
              ? 'text-xs font-medium py-1 transition-all' 
              : 'text-lg font-medium py-1'} 
              text-gray-300 data-[state=active]:bg-white/10 data-[state=active]:text-white
              data-[state=active]:shadow-md data-[state=active]:scale-[1.02] data-[state=active]:font-semibold 
              transition-all duration-200 hover:bg-white/10`}
          >
            Sign Up
          </TabsTrigger>
        </TabsList>
      </div>

      <div className={`${isMobile ? 'p-4 pt-4 pb-5' : 'px-10 py-8'} bg-transparent backdrop-blur-md`}>
        <TabsContent value="signin" className="mt-0">
          <div className="flex flex-col space-y-4">
            {!isMobile && (
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-white mb-2">Welcome Back</h3>
                <p className="text-base text-gray-300">Sign in for additional features</p>
              </div>
            )}
            <SignInForm 
              onOpenChange={onOpenChange}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="signup" className="mt-0">
          <div className="flex flex-col space-y-4">
            {!isMobile && (
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-white mb-2">Join Our Community</h3>
                <p className="text-base text-gray-300">Create an account to get started</p>
              </div>
            )}
            <SignUpForm 
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              onOpenChange={onOpenChange}
            />
          </div>
        </TabsContent>
      </div>
      
      <div className="border-t border-white/10 bg-transparent backdrop-blur-sm py-4 px-10 flex justify-center">
        <p className="text-sm text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis">
          By signing in, you agree to our <a href="#" className="text-[#ea384c] hover:underline">Terms of Service</a> and <a href="#" className="text-[#ea384c] hover:underline">Privacy Policy</a>
        </p>
      </div>
    </Tabs>
  );
};
