
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "./forms/SignInForm";
import { SignUpForm } from "./forms/SignUpForm";

interface AuthFormProps {
  onOpenChange: (open: boolean) => void;
}

export const AuthForm = ({ onOpenChange }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Tabs defaultValue="signin" className="w-full">
      <div className="px-8 pt-4">
        <TabsList className="w-full grid grid-cols-2 h-12 bg-gray-100/70 p-1.5 rounded-xl gap-3">
          <TabsTrigger 
            value="signin" 
            className="rounded-lg text-sm font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:scale-105 data-[state=active]:font-semibold transition-all duration-200 hover:bg-white/50"
          >
            Sign In
          </TabsTrigger>
          <TabsTrigger 
            value="signup"
            className="rounded-lg text-sm font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:scale-105 data-[state=active]:font-semibold transition-all duration-200 hover:bg-white/50"
          >
            Sign Up
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="p-8 pt-6">
        <TabsContent value="signin">
          <SignInForm 
            onOpenChange={onOpenChange}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </TabsContent>

        <TabsContent value="signup">
          <SignUpForm 
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};
