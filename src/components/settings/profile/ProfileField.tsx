
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "./CopyUtils";

interface ProfileFieldProps {
  label: string;
  value: string | null;
  copyLabel?: string;
}

export const ProfileField = ({ label, value, copyLabel }: ProfileFieldProps) => {
  if (!value) return null;
  
  const handleCopy = () => {
    copyToClipboard(value, copyLabel || label);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium mb-1">{label}</p>
        <p className="text-xs text-muted-foreground break-all">
          {value}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="h-8 w-8 flex-shrink-0"
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
