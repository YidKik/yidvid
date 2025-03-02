
import { LayoutConfig, SpacingProperty, VisibilityDevice } from "./types";
import { SectionCard } from "./SectionCard";

interface ControlsPanelProps {
  sections: LayoutConfig[];
  onOrderChange: (sectionId: string, type: 'mobile' | 'desktop', value: string) => void;
  onSpacingChange: (sectionId: string, property: SpacingProperty, value: string) => void;
  onVisibilityChange: (sectionId: string, device: VisibilityDevice) => void;
}

export const ControlsPanel = ({ 
  sections, 
  onOrderChange, 
  onSpacingChange, 
  onVisibilityChange 
}: ControlsPanelProps) => {
  return (
    <div className="w-1/2 overflow-y-auto p-6 border-r">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Layout Customization</h2>
        </div>

        <div className="grid gap-6">
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              onOrderChange={onOrderChange}
              onSpacingChange={onSpacingChange}
              onVisibilityChange={onVisibilityChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
