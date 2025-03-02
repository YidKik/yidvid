
import { Youtube } from "lucide-react";

export const ChannelsGridSkeleton = () => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4">
      <div className="flex items-center justify-between mb-3 md:mb-8">
        <h2 className="text-base md:text-2xl font-bold text-accent">View All Channels</h2>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="w-12 h-12 md:w-20 md:h-20 bg-gray-200 rounded-full mb-2 mx-auto" />
            <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};
