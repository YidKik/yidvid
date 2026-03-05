
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";

interface VideoGridLoaderProps {
  text?: string;
}

export const VideoGridLoader = ({ text }: VideoGridLoaderProps) => {
  const { isMobile } = useIsMobile();
  
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        isMobile ? "min-h-[200px]" : "min-h-[400px]"
      )}
    >
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
};
