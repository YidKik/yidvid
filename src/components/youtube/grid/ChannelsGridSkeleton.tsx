
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";

export const ChannelsGridSkeleton = () => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4 h-[300px] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <LoadingAnimation 
          size="medium" 
          color="accent" 
          text="Loading channels..."
        />
      </div>
    </div>
  );
};
