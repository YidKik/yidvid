
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";

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
      <LoadingAnimation
        size={isMobile ? "small" : "medium"}
        color="primary"
        text={text}
      />
    </div>
  );
};
