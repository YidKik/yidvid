
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
      <div className={`px-2 ${isMobile ? 'pt-1' : 'px-8 pt-6'}`}>
        <TabsList className="w-full grid grid-cols-2 h-7 bg-gray-50/80 p-0.5 rounded-lg gap-1">
          <TabsTrigger 
            value="signin" 
            className={`rounded-md ${isMobile ? 'text-[10px]' : 'text-xs'} font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:scale-105 data-[state=active]:font-semibold transition-all duration-300 hover:bg-white/80`}
          >
            Sign In
          </TabsTrigger>
          <TabsTrigger 
            value="signup"
            className={`rounded-md ${isMobile ? 'text-[10px]' : 'text-xs'} font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:scale-105 data-[state=active]:font-semibold transition-all duration-300 hover:bg-white/80`}
          >
            Sign Up
          </TabsTrigger>
        </TabsList>
      </div>

      <div className={`${isMobile ? 'p-2 pt-1 pb-2' : 'p-8 pt-6'}`}>
        <TabsContent value="signin" className="mt-0">
          <SignInForm 
            onOpenChange={onOpenChange}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </TabsContent>

        <TabsContent value="signup" className="mt-0">
          <SignUpForm 
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onOpenChange={onOpenChange}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};
