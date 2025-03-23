
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SignInForm } from "./forms/SignInForm";
import { SignUpForm } from "./forms/SignUpForm";
import { TermsOfServiceDialog } from "./TermsOfServiceDialog";
import { PrivacyPolicyDialog } from "./PrivacyPolicyDialog";
import { AuthTermsFooter } from "./AuthTermsFooter";

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
      
      <AuthTermsFooter 
        onOpenTos={() => setTosDialogOpen(true)}
        onOpenPrivacy={() => setPrivacyDialogOpen(true)}
      />

      <TermsOfServiceDialog isOpen={tosDialogOpen} onOpenChange={setTosDialogOpen} />
      <PrivacyPolicyDialog isOpen={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen} />
    </div>
  );
};
