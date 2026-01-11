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
      className="mt-6 pt-4 border-t border-gray-100 text-center"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      <p className="text-xs text-gray-500 leading-relaxed">
        By signing in, you agree to our{" "}
        <button 
          onClick={onOpenTos} 
          className="text-red-500 bg-transparent p-0 border-none inline font-semibold text-xs hover:text-red-600 hover:underline underline-offset-2 transition-colors"
        >
          Terms of Service
        </button>{" "}and{" "}
        <button 
          onClick={onOpenPrivacy} 
          className="text-red-500 bg-transparent p-0 border-none inline font-semibold text-xs hover:text-red-600 hover:underline underline-offset-2 transition-colors"
        >
          Privacy Policy
        </button>
      </p>
    </div>
  );
};
