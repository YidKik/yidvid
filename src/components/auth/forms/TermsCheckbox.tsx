
import React, { useState } from "react";
import { TermsOfServiceDialog } from "../TermsOfServiceDialog";
import { PrivacyPolicyDialog } from "../PrivacyPolicyDialog";

interface TermsCheckboxProps {
  disabled?: boolean;
}

export const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ disabled = false }) => {
  const [tosDialogOpen, setTosDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  
  return (
    <>
      <div className="flex items-center">
        <input 
          id="terms" 
          type="checkbox" 
          className="h-4 w-4 text-gray-600 rounded border-gray-300 focus:ring-gray-500"
          disabled={disabled}
        />
        <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
          I agree to the {" "}
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setTosDialogOpen(true);
            }} 
            className="text-gray-700 hover:text-gray-900 transition-colors bg-transparent p-0 border-none inline font-medium underline-offset-2 hover:underline"
          >
            Terms of Service
          </button> and {" "}
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setPrivacyDialogOpen(true);
            }} 
            className="text-gray-700 hover:text-gray-900 transition-colors bg-transparent p-0 border-none inline font-medium underline-offset-2 hover:underline"
          >
            Privacy Policy
          </button>
        </label>
      </div>
      
      <TermsOfServiceDialog isOpen={tosDialogOpen} onOpenChange={setTosDialogOpen} />
      <PrivacyPolicyDialog isOpen={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen} />
    </>
  );
};
