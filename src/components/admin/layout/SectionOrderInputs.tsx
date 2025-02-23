
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutConfig } from "./types";

interface SectionOrderInputsProps {
  section: LayoutConfig;
  onOrderChange: (sectionId: string, type: 'mobile' | 'desktop', value: string) => void;
}

export const SectionOrderInputs = ({ section, onOrderChange }: SectionOrderInputsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label>Mobile Order</Label>
        <Input 
          type="number" 
          value={section.mobile_order}
          onChange={(e) => onOrderChange(section.id, 'mobile', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Desktop Order</Label>
        <Input 
          type="number" 
          value={section.desktop_order}
          onChange={(e) => onOrderChange(section.id, 'desktop', e.target.value)}
        />
      </div>
    </>
  );
};
