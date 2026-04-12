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
    <div 
      className="px-8 py-6 bg-white"
      style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
    >
      {initialTab === 'signin' ? (
        <SignInForm 
          onOpenChange={onOpenChange}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          hideRememberMe={true}
          hideSocialButtons={false}
        />
      ) : (
        <SignUpForm 
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onOpenChange={onOpenChange}
          hideSocialButtons={false}
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
