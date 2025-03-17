
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
      <div className={`${isMobile ? 'px-4 pt-3' : 'px-10 pt-8'} bg-white`}>
        <TabsList className={`w-full grid grid-cols-2 ${isMobile 
          ? 'h-9 bg-gray-100 p-1 rounded-lg gap-1 shadow-none' 
          : 'h-14 bg-gray-100 p-1 rounded-xl gap-4 shadow-sm'}`}
        >
          <TabsTrigger 
            value="signin" 
            className={`rounded-md ${isMobile 
              ? 'text-xs font-medium py-1 transition-all' 
              : 'text-lg font-medium py-1'} 
              text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 
              data-[state=active]:shadow-md data-[state=active]:scale-[1.02] data-[state=active]:font-semibold 
              transition-all duration-200 hover:bg-white/80`}
          >
            Sign In
          </TabsTrigger>
          <TabsTrigger 
            value="signup"
            className={`rounded-md ${isMobile 
              ? 'text-xs font-medium py-1 transition-all' 
              : 'text-lg font-medium py-1'} 
              text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900
              data-[state=active]:shadow-md data-[state=active]:scale-[1.02] data-[state=active]:font-semibold 
              transition-all duration-200 hover:bg-white/80`}
          >
            Sign Up
          </TabsTrigger>
        </TabsList>
      </div>

      <div className={`${isMobile ? 'p-4 pt-4 pb-5' : 'px-10 py-8'} bg-white`}>
        <TabsContent value="signin" className="mt-0">
          <div className="flex flex-col space-y-4">
            {!isMobile && (
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h3>
                <p className="text-base text-gray-600">Sign in for additional features</p>
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
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Join Our Community</h3>
                <p className="text-base text-gray-600">Create an account to get started</p>
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
      
      <div className="border-t border-gray-200 bg-gray-50 py-4 px-10 flex justify-center">
        <p className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
          By signing in, you agree to our <a href="#" className="text-[#ea384c] hover:underline">Terms of Service</a> and <a href="#" className="text-[#ea384c] hover:underline">Privacy Policy</a>
        </p>
      </div>
    </Tabs>
  );
};
