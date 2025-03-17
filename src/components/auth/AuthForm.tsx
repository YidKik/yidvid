
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SignInForm } from "./forms/SignInForm";
import { SignUpForm } from "./forms/SignUpForm";
import { TermsOfServiceDialog } from "./TermsOfServiceDialog";
import { PrivacyPolicyDialog } from "./PrivacyPolicyDialog";

interface AuthFormProps {
  onOpenChange: (open: boolean) => void;
  initialTab?: 'signin' | 'signup';
  hideOptions?: boolean;
}

export const AuthForm = ({ onOpenChange, initialTab = 'signin', hideOptions = false }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const [tosDialogOpen, setTosDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  
  return (
    <div className={`${isMobile ? 'p-4 pt-4 pb-5' : 'px-10 py-8'} bg-white`}>
      {initialTab === 'signin' ? (
        <SignInForm 
          onOpenChange={onOpenChange}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          hideRememberMe={true}
          hideSocialButtons={true}
        />
      ) : (
        <SignUpForm 
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onOpenChange={onOpenChange}
          hideSocialButtons={true}
        />
      )}
      
      <div className="border-t border-gray-200 bg-gray-50 py-4 px-10 flex justify-center mt-6">
        <p className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
          By signing in, you agree to our {" "}
          <button 
            onClick={() => setTosDialogOpen(true)} 
            className="text-[#ea384c] hover:underline bg-transparent p-0 border-none inline font-normal"
          >
            Terms of Service
          </button> and {" "}
          <button 
            onClick={() => setPrivacyDialogOpen(true)} 
            className="text-[#ea384c] hover:underline bg-transparent p-0 border-none inline font-normal"
          >
            Privacy Policy
          </button>
        </p>
      </div>

      <TermsOfServiceDialog isOpen={tosDialogOpen} onOpenChange={setTosDialogOpen} />
      <PrivacyPolicyDialog isOpen={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen} />
    </div>
  );
};
