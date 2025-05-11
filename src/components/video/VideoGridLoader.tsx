
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { DelayedLoadingAnimation } from "@/components/ui/DelayedLoadingAnimation";

interface VideoGridLoaderProps {
  text?: string;
}

export const VideoGridLoader = ({ text = "Loading videos..." }: VideoGridLoaderProps) => {
  const { isMobile } = useIsMobile();
  
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        isMobile ? "min-h-[200px]" : "min-h-[400px]"
      )}
    >
      <DelayedLoadingAnimation
        size={isMobile ? "small" : "medium"}
        text={text}
        delayMs={1000} // Reduced from 3000 to 1000 to show sooner
      />
    </div>
  );
};
