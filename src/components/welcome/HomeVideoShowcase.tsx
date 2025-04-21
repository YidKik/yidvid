
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { HomeVideoShowcaseSection } from "./HomeVideoShowcaseSection";
import { AnimatedVideoRowsShowcase } from "./AnimatedVideoRowsShowcase";

/**
 * HomeVideoShowcase - displays extremely large immersive animated video rows
 * that fill the entire screen as a background effect
 */
export const HomeVideoShowcase = () => {
  // Request many more videos for a truly massive full-screen experience
  const { videos, loading } = useVideoGridData(80);

  return (
    <div className="w-full overflow-hidden absolute inset-0 z-0">
      <HomeVideoShowcaseSection loading={loading} videos={videos}>
        <AnimatedVideoRowsShowcase videos={videos} loading={loading} />
      </HomeVideoShowcaseSection>
    </div>
  );
};
