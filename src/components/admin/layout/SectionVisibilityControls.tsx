
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LayoutConfig, VisibilityDevice } from "./types";

interface SectionVisibilityControlsProps {
  section: LayoutConfig;
  onVisibilityChange: (sectionId: string, device: VisibilityDevice) => void;
}

export const SectionVisibilityControls = ({ section, onVisibilityChange }: SectionVisibilityControlsProps) => {
  return (
    <div className="col-span-2">
      <Label>Visibility</Label>
      <div className="flex gap-4 mt-2">
        <Button
          variant={section.visibility.mobile ? "default" : "outline"}
          onClick={() => onVisibilityChange(section.id, 'mobile')}
        >
          Show on Mobile
        </Button>
        <Button
          variant={section.visibility.desktop ? "default" : "outline"}
          onClick={() => onVisibilityChange(section.id, 'desktop')}
        >
          Show on Desktop
        </Button>
      </div>
    </div>
  );
};
