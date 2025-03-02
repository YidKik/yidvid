
import { useLayoutData } from "./layout/useLayoutData";
import { LoadingState } from "./layout/LoadingState";
import { EmptyState } from "./layout/EmptyState";
import { ControlsPanel } from "./layout/ControlsPanel";
import { PreviewPanel } from "./layout/PreviewPanel";

export const LayoutCustomizer = () => {
  const { 
    sections, 
    loading, 
    handleOrderChange, 
    handleSpacingChange, 
    handleVisibilityChange 
  } = useLayoutData();

  if (loading) {
    return <LoadingState />;
  }

  if (sections.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      {/* Controls Panel */}
      <ControlsPanel 
        sections={sections}
        onOrderChange={handleOrderChange}
        onSpacingChange={handleSpacingChange}
        onVisibilityChange={handleVisibilityChange}
      />

      {/* Live Preview Panel */}
      <PreviewPanel sections={sections} />
    </div>
  );
};
