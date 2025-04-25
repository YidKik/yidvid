
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChannelInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const ChannelInput = ({ 
  value, 
  onChange, 
  disabled, 
  placeholder, 
  className 
}: ChannelInputProps) => {
  return (
    <div className="space-y-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={className}
      />
    </div>
  );
};
