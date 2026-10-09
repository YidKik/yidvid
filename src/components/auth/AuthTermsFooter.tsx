import React from "react";

interface AuthTermsFooterProps {
  onOpenTos: () => void;
  onOpenPrivacy: () => void;
}

export const AuthTermsFooter: React.FC<AuthTermsFooterProps> = ({ 
  onOpenTos, 
  onOpenPrivacy 
}) => {
  return (
    <div 
      className="auth-terms-footer mt-6 pt-4 border-t border-border text-center"
    >
      <p className="type-footer text-muted-foreground">
        By signing in, you agree to our{" "}
        <button 
          onClick={onOpenTos} 
          className="text-brand bg-transparent p-0 border-none inline font-semibold hover:underline underline-offset-2 transition-colors"
        >
          Terms of Service
        </button>{" "}and{" "}
        <button 
          onClick={onOpenPrivacy} 
          className="text-brand bg-transparent p-0 border-none inline font-semibold hover:underline underline-offset-2 transition-colors"
        >
          Privacy Policy
        </button>
      </p>
    </div>
  );
};
