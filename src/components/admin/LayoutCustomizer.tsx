
import { useLayoutConfig } from "./layout/useLayoutConfig";
import { LoadingState } from "./layout/LoadingState";
import { EmptyState } from "./layout/EmptyState";
import { ControlsPanel } from "./layout/ControlsPanel";
import { LivePreview } from "./layout/LivePreview";

export const LayoutCustomizer = () => {
  const {
    sections,
    loading,
    selectedSectionId,
    setSelectedSectionId,
    handleOrderChange,
    handleSpacingChange,
    handleVisibilityChange
  } = useLayoutConfig();

  if (loading) {
    return <LoadingState />;
  }

  if (sections.length === 0) {
    return <EmptyState />;
  }

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      <ControlsPanel
        selectedSection={selectedSection}
        onOrderChange={handleOrderChange}
        onSpacingChange={handleSpacingChange}
        onVisibilityChange={handleVisibilityChange}
      />

      <div className="w-2/3 overflow-y-auto bg-gray-50">
        <div className="sticky top-0 bg-white p-4 shadow-sm mb-6">
          <h2 className="text-xl font-semibold">Live Preview</h2>
          <p className="text-sm text-muted-foreground mt-1">Click on any section to customize it</p>
        </div>
        <div className="p-6">
          <LivePreview 
            sections={sections} 
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
          />
        </div>
      </div>
    </div>
  );
};
