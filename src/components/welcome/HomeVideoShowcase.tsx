
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { HomeVideoShowcaseSection } from "./HomeVideoShowcaseSection";
import { AnimatedVideoRowsShowcase } from "./AnimatedVideoRowsShowcase";

/**
 * HomeVideoShowcase - displays extremely large immersive animated video rows
 * that fill most of the screen as a background effect
 */
export const HomeVideoShowcase = () => {
  // Request many more videos for a truly immersive full-screen experience
  const { videos, loading } = useVideoGridData(60);

  return (
    <div className="w-full overflow-hidden">
      <HomeVideoShowcaseSection loading={loading} videos={videos}>
        <AnimatedVideoRowsShowcase videos={videos} loading={loading} />
      </HomeVideoShowcaseSection>
    </div>
  );
};
