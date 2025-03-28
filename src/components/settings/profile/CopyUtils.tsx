
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface CopyToClipboardProps {
  textToCopy: string;
  label?: string;
}

export const CopyToClipboard = ({ textToCopy, label = "Content" }: CopyToClipboardProps) => {
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();
  
  const handleCopy = () => {
    if (!textToCopy) return;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        toast.success(`${label} copied to clipboard`, {
          duration: 2000,
          position: "bottom-center",
        });
        
        // Reset icon after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch((error) => {
        console.error(`Failed to copy ${label.toLowerCase()}:`, error);
        toast.error("Failed to copy to clipboard", {
          position: "bottom-center"
        });
      });
  };
  
  return (
    <button 
      onClick={handleCopy}
      className={`ml-1 p-0.5 rounded-sm hover:bg-muted/50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary/30 ${copied ? 'text-green-500' : 'text-muted-foreground'}`}
      title={`Copy ${label.toLowerCase()} to clipboard`}
      aria-label={`Copy ${label.toLowerCase()} to clipboard`}
    >
      {copied ? (
        <Check className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'}`} />
      ) : (
        <Copy className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'}`} />
      )}
    </button>
  );
};
