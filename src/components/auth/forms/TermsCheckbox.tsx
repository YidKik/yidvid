
import React from "react";

interface TermsCheckboxProps {
  disabled?: boolean;
}

export const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ disabled = false }) => {
  return (
    <div className="flex items-center">
      <input 
        id="terms" 
        type="checkbox" 
        className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
        disabled={disabled}
      />
      <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
        I agree to the <a href="#" className="text-purple-600 hover:underline">Terms of Service</a> and <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
      </label>
    </div>
  );
};
