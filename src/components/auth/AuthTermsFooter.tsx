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
      className="mt-6 pt-5 border-t border-[#EEEEEE] text-center"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      <p className="text-xs text-[#AAAAAA] leading-relaxed">
        By signing in, you agree to our{" "}
        <button 
          onClick={onOpenTos} 
          className="text-[#FF0000] bg-transparent p-0 border-none inline font-semibold text-xs hover:underline underline-offset-2 transition-colors"
        >
          Terms of Service
        </button>{" "}and{" "}
        <button 
          onClick={onOpenPrivacy} 
          className="text-[#FF0000] bg-transparent p-0 border-none inline font-semibold text-xs hover:underline underline-offset-2 transition-colors"
        >
          Privacy Policy
        </button>
      </p>
    </div>
  );
};
