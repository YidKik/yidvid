
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
      <div className={`${isMobile ? 'px-3 pt-2' : 'px-16 pt-8'}`}>
        <TabsList className={`w-full grid grid-cols-2 ${isMobile 
          ? 'h-8 bg-gray-50/80 p-0.5 rounded-lg gap-1 shadow-sm' 
          : 'h-12 bg-purple-50/70 p-1 rounded-xl gap-4 shadow-sm'}`}
        >
          <TabsTrigger 
            value="signin" 
            className={`rounded-md ${isMobile 
              ? 'text-[11px] py-1' 
              : 'text-base font-medium py-1'} 
              text-gray-600 data-[state=active]:bg-white data-[state=active]:text-purple-600 
              data-[state=active]:shadow-md data-[state=active]:scale-105 data-[state=active]:font-semibold 
              transition-all duration-300 hover:bg-white/80`}
          >
            Sign In
          </TabsTrigger>
          <TabsTrigger 
            value="signup"
            className={`rounded-md ${isMobile 
              ? 'text-[11px] py-1' 
              : 'text-base font-medium py-1'} 
              text-gray-600 data-[state=active]:bg-white data-[state=active]:text-purple-600 
              data-[state=active]:shadow-md data-[state=active]:scale-105 data-[state=active]:font-semibold 
              transition-all duration-300 hover:bg-white/80`}
          >
            Sign Up
          </TabsTrigger>
        </TabsList>
      </div>

      <div className={`${isMobile ? 'p-3 pt-3 pb-4' : 'p-16 pt-8 pb-14'}`}>
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
