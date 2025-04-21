
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { HomeVideoShowcaseSection } from "./HomeVideoShowcaseSection";
import { AnimatedVideoRowsShowcase } from "./AnimatedVideoRowsShowcase";

/**
 * HomeVideoShowcase - displays large immersive animated video rows
 */
export const HomeVideoShowcase = () => {
  // Request more videos for a more immersive experience
  const { videos, loading } = useVideoGridData(48);

  return (
    <HomeVideoShowcaseSection loading={loading} videos={videos}>
      <AnimatedVideoRowsShowcase videos={videos} loading={loading} />
    </HomeVideoShowcaseSection>
  );
};
