
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessageLoadingDots } from "@/components/ui/loading/MessageLoadingDots";

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
      <MessageLoadingDots
        size={isMobile ? "small" : "medium"}
        text={text}
      />
    </div>
  );
};
