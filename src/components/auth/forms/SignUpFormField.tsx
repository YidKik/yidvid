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
        className="text-sm font-semibold text-foreground flex items-center gap-2"
        style={{ fontFamily: "'Quicksand', sans-serif" }}
      >
        <Icon size={15} className="text-brand" />
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
          px-4 border-2 border-border bg-muted focus:bg-white transition-all duration-200 
          rounded-card focus:ring-2 focus:ring-brand/40 focus:border-brand text-foreground
          placeholder:text-muted-foreground py-3`}
        style={{ fontFamily: "'Quicksand', sans-serif" }}
        required={required}
        disabled={disabled}
        minLength={minLength}
      />
    </div>
  );
};
