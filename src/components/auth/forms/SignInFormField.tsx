import React from "react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { Mail, Lock } from "lucide-react";

interface SignInFormFieldProps {
  type: "email" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
}

export const SignInFormField: React.FC<SignInFormFieldProps> = ({
  type,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = true,
  minLength,
}) => {
  const isMobile = useIsMobile();
  const Icon = type === "email" ? Mail : Lock;
  
  return (
    <div className="space-y-1.5">
      <label 
        className="text-sm font-semibold text-foreground flex items-center gap-1.5"
      >
        <Icon size={14} className="text-brand" />
        {placeholder}
      </label>
      <Input
        type={type}
        placeholder={`Enter your ${placeholder.toLowerCase()}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${isMobile 
          ? 'h-11 text-sm' 
          : 'h-12 text-base'} 
          px-4 border-2 border-input bg-muted focus:bg-background transition-all duration-200 
          rounded-card focus:ring-2 focus:ring-ring focus:border-brand text-foreground
          placeholder:text-muted-foreground`}
        required={required}
        disabled={disabled}
        minLength={minLength}
      />
    </div>
  );
};
