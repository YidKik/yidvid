
import React from "react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

interface SignUpFormFieldProps {
  type: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
}

export const SignUpFormField: React.FC<SignUpFormFieldProps> = ({
  type,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = true,
  minLength,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-2">
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${isMobile 
          ? 'h-10 text-sm' 
          : 'h-12 text-base'} 
          px-4 border-[#E9ECEF] bg-[#F8F9FA] focus:bg-white transition-all duration-300 
          rounded-lg focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 shadow-sm text-gray-800`}
        required={required}
        disabled={disabled}
        minLength={minLength}
      />
    </div>
  );
};
