
import { LayoutConfig } from "./types";
import { SectionCard } from "./SectionCard";

interface ControlsPanelProps {
  selectedSection: LayoutConfig | undefined;
  onOrderChange: (sectionId: string, type: 'mobile' | 'desktop', value: string) => void;
  onSpacingChange: (sectionId: string, property: 'marginTop' | 'marginBottom' | 'padding', value: string) => void;
  onVisibilityChange: (sectionId: string, device: 'mobile' | 'desktop') => void;
}

export const ControlsPanel = ({
  selectedSection,
  onOrderChange,
  onSpacingChange,
  onVisibilityChange
}: ControlsPanelProps) => {
  return (
    <div className="w-1/3 overflow-y-auto p-6 border-r">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Layout Customization</h2>
        </div>

        {selectedSection ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">{selectedSection.name}</h3>
            <SectionCard
              key={selectedSection.id}
              section={selectedSection}
              onOrderChange={onOrderChange}
              onSpacingChange={onSpacingChange}
              onVisibilityChange={onVisibilityChange}
            />
          </div>
        ) : (
          <p className="text-muted-foreground">Select a section on the right to customize it</p>
        )}
      </div>
    </div>
  );
};
