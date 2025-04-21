
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { HomeVideoShowcaseSection } from "./HomeVideoShowcaseSection";
import { AnimatedVideoRowsShowcase } from "./AnimatedVideoRowsShowcase";

/**
 * HomeVideoShowcase (refactored)
 */
export const HomeVideoShowcase = () => {
  const { videos, loading } = useVideoGridData(40);

  return (
    <HomeVideoShowcaseSection loading={loading} videos={videos}>
      <AnimatedVideoRowsShowcase videos={videos} loading={loading} />
    </HomeVideoShowcaseSection>
  );
};
