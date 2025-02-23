
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutConfig, SpacingProperty } from "./types";

interface SectionSpacingControlsProps {
  section: LayoutConfig;
  onSpacingChange: (sectionId: string, property: SpacingProperty, value: string) => void;
}

export const SectionSpacingControls = ({ section, onSpacingChange }: SectionSpacingControlsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label>Top Margin</Label>
        <Select 
          onValueChange={(value) => onSpacingChange(section.id, 'marginTop', value)} 
          defaultValue={section.spacing.marginTop}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select margin" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="0">None</SelectItem>
              <SelectItem value="mt-2">Small</SelectItem>
              <SelectItem value="mt-4">Medium</SelectItem>
              <SelectItem value="mt-6">Large</SelectItem>
              <SelectItem value="mt-8">Extra Large</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Bottom Margin</Label>
        <Select 
          onValueChange={(value) => onSpacingChange(section.id, 'marginBottom', value)}
          defaultValue={section.spacing.marginBottom}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select margin" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="0">None</SelectItem>
              <SelectItem value="mb-2">Small</SelectItem>
              <SelectItem value="mb-4">Medium</SelectItem>
              <SelectItem value="mb-6">Large</SelectItem>
              <SelectItem value="mb-8">Extra Large</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
