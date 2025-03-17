
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "./forms/SignInForm";
import { SignUpForm } from "./forms/SignUpForm";
import { useIsMobile } from "@/hooks/use-mobile";

interface AuthFormProps {
  onOpenChange: (open: boolean) => void;
}

export const AuthForm = ({ onOpenChange }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <Tabs defaultValue="signin" className="w-full">
      <div className={`${isMobile ? 'px-4 pt-3' : 'px-16 pt-6'} bg-white`}>
        <TabsList className={`w-full grid grid-cols-2 ${isMobile 
          ? 'h-9 bg-[#E5DEFF] p-1 rounded-lg gap-1 shadow-none' 
          : 'h-12 bg-[#F5F3FF] p-1 rounded-xl gap-4 shadow-sm'}`}
        >
          <TabsTrigger 
            value="signin" 
            className={`rounded-md ${isMobile 
              ? 'text-xs font-medium py-1 transition-all' 
              : 'text-base font-medium py-1'} 
              text-gray-700 data-[state=active]:bg-white data-[state=active]:text-[#8B5CF6] 
              data-[state=active]:shadow-md data-[state=active]:scale-[1.02] data-[state=active]:font-semibold 
              transition-all duration-200 hover:bg-white/80`}
          >
            Sign In
          </TabsTrigger>
          <TabsTrigger 
            value="signup"
            className={`rounded-md ${isMobile 
              ? 'text-xs font-medium py-1 transition-all' 
              : 'text-base font-medium py-1'} 
              text-gray-700 data-[state=active]:bg-white data-[state=active]:text-[#8B5CF6] 
              data-[state=active]:shadow-md data-[state=active]:scale-[1.02] data-[state=active]:font-semibold 
              transition-all duration-200 hover:bg-white/80`}
          >
            Sign Up
          </TabsTrigger>
        </TabsList>
      </div>

      <div className={`${isMobile ? 'p-4 pt-4 pb-5' : 'px-16 py-8 grid grid-cols-2 gap-8'} bg-white`}>
        <TabsContent value="signin" className="mt-0">
          <div className={isMobile ? '' : 'flex flex-col space-y-4'}>
            {!isMobile && (
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome Back</h3>
                <p className="text-sm text-gray-500">Sign in to continue exploring our platform</p>
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
          <div className={isMobile ? '' : 'flex flex-col space-y-4'}>
            {!isMobile && (
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Join Our Community</h3>
                <p className="text-sm text-gray-500">Create an account to get started</p>
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
      
      {!isMobile && (
        <div className="border-t border-gray-100 bg-gray-50/50 py-4 px-16 flex justify-center">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our <a href="#" className="text-purple-600 hover:underline">Terms of Service</a> and <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      )}
    </Tabs>
  );
};
