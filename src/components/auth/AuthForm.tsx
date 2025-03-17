
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
              hideRememberMe={true}
              hideSocialButtons={true}
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
              hideSocialButtons={true}
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
