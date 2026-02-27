import React from "react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { User, Mail, Lock } from "lucide-react";

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
  
  const getIcon = () => {
    if (type === "email") return Mail;
    if (type === "password") return Lock;
    return User;
  };
  
  const Icon = getIcon();
  
  return (
    <div className="space-y-2">
      <label 
        className="text-sm font-semibold text-[#444444] flex items-center gap-2"
        style={{ fontFamily: "'Quicksand', sans-serif" }}
      >
        <Icon size={15} className="text-[#FF0000]" />
        {placeholder}
      </label>
      <Input
        type={type}
        placeholder={`Enter your ${placeholder.toLowerCase()}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${isMobile 
          ? 'h-12 text-sm' 
          : 'h-13 text-base'} 
          px-4 border-2 border-[#E5E5E5] bg-[#FAFAFA] focus:bg-white transition-all duration-200 
          rounded-2xl focus:ring-2 focus:ring-[#FFCC00]/40 focus:border-[#FFCC00] text-[#1A1A1A]
          placeholder:text-[#BBBBBB] py-3`}
        style={{ fontFamily: "'Quicksand', sans-serif" }}
        required={required}
        disabled={disabled}
        minLength={minLength}
      />
    </div>
  );
};
