
import { MusicGrid } from "@/components/music/MusicGrid";

export const MusicSection = () => {
  return (
    <div className="min-h-[60vh] md:min-h-[70vh] flex flex-col items-center justify-start pt-12 md:pt-16 relative">
      <div className="text-center max-w-2xl mx-auto px-4 z-20">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary animate-fade-in">Coming Soon!</h2>
        <p className="text-base md:text-lg text-gray-800 animate-fade-in delay-100">
          We're working on bringing you an amazing collection of kosher music. 
          Stay tuned for a curated selection of artists and tracks that will elevate your listening experience!
        </p>
      </div>
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10" />
      <div className="w-full mt-12 opacity-30 pointer-events-none">
        <MusicGrid />
      </div>
    </div>
  );
};
