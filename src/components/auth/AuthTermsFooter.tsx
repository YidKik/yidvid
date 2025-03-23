
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
    <div className="mt-6 text-center">
      <p className="text-xs text-black leading-relaxed">
        By signing in, you agree to our{" "}
        <button 
          onClick={onOpenTos} 
          className="text-black bg-transparent p-0 border-none inline font-medium text-xs underline-offset-2 hover:underline"
        >
          Terms of Service
        </button>{" "}and{" "}
        <button 
          onClick={onOpenPrivacy} 
          className="text-black bg-transparent p-0 border-none inline font-medium text-xs underline-offset-2 hover:underline"
        >
          Privacy Policy
        </button>
      </p>
    </div>
  );
};
