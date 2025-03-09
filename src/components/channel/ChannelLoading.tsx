
import { BackButton } from "@/components/navigation/BackButton";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";

export const ChannelLoading = () => {
  return (
    <div className="container mx-auto p-4 mt-16">
      <BackButton />
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <LoadingAnimation 
          size="large" 
          color="primary"
          text="Loading channel..." 
        />
      </div>
    </div>
  );
};
