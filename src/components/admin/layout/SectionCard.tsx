
import { Card } from "@/components/ui/card";
import { LayoutConfig, SpacingProperty, VisibilityDevice } from "./types";
import { SectionOrderInputs } from "./SectionOrderInputs";
import { SectionSpacingControls } from "./SectionSpacingControls";
import { SectionVisibilityControls } from "./SectionVisibilityControls";

interface SectionCardProps {
  section: LayoutConfig;
  onOrderChange: (sectionId: string, type: 'mobile' | 'desktop', value: string) => void;
  onSpacingChange: (sectionId: string, property: SpacingProperty, value: string) => void;
  onVisibilityChange: (sectionId: string, device: VisibilityDevice) => void;
}

export const SectionCard = ({ 
  section,
  onOrderChange,
  onSpacingChange,
  onVisibilityChange,
}: SectionCardProps) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{section.name}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SectionOrderInputs 
            section={section}
            onOrderChange={onOrderChange}
          />
          <SectionSpacingControls 
            section={section}
            onSpacingChange={onSpacingChange}
          />
          <SectionVisibilityControls 
            section={section}
            onVisibilityChange={onVisibilityChange}
          />
        </div>
      </div>
    </Card>
  );
};
