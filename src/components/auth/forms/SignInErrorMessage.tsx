
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SignInErrorMessageProps {
  error: string;
}

export const SignInErrorMessage: React.FC<SignInErrorMessageProps> = ({ error }) => {
  const isMobile = useIsMobile();
  
  if (!error) return null;
  
  return (
    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-red-600 font-medium p-2 bg-red-50 rounded-lg border border-red-100`}>
      {error}
    </div>
  );
};
