
import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/navigation/BackButton";

export const ChannelLoading = () => {
  return (
    <div className="container mx-auto p-4 mt-16">
      <BackButton />
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="h-20 w-20 md:h-32 md:w-32 rounded-full" />
        <Skeleton className="h-6 w-48 md:h-8 md:w-64" />
        <Skeleton className="h-4 w-36 md:h-4 md:w-48" />
      </div>
    </div>
  );
};
