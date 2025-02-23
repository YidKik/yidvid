
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { LayoutConfig, SpacingProperty, VisibilityDevice } from "./types";

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{section.name}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Controls */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mobile Order</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  value={section.mobile_order}
                  onChange={(e) => onOrderChange(section.id, 'mobile', e.target.value)}
                  className="w-24"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onOrderChange(section.id, 'mobile', (section.mobile_order - 1).toString())}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onOrderChange(section.id, 'mobile', (section.mobile_order + 1).toString())}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Desktop Order</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  value={section.desktop_order}
                  onChange={(e) => onOrderChange(section.id, 'desktop', e.target.value)}
                  className="w-24"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onOrderChange(section.id, 'desktop', (section.desktop_order - 1).toString())}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onOrderChange(section.id, 'desktop', (section.desktop_order + 1).toString())}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Spacing Controls */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Top Margin</Label>
              <Select 
                value={section.spacing.marginTop}
                onValueChange={(value) => onSpacingChange(section.id, 'marginTop', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select margin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="mt-0">None</SelectItem>
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
                value={section.spacing.marginBottom}
                onValueChange={(value) => onSpacingChange(section.id, 'marginBottom', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select margin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="mb-0">None</SelectItem>
                    <SelectItem value="mb-2">Small</SelectItem>
                    <SelectItem value="mb-4">Medium</SelectItem>
                    <SelectItem value="mb-6">Large</SelectItem>
                    <SelectItem value="mb-8">Extra Large</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Padding</Label>
              <Select 
                value={section.spacing.padding}
                onValueChange={(value) => onSpacingChange(section.id, 'padding', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select padding" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="p-0">None</SelectItem>
                    <SelectItem value="p-2">Small</SelectItem>
                    <SelectItem value="p-4">Medium</SelectItem>
                    <SelectItem value="p-6">Large</SelectItem>
                    <SelectItem value="p-8">Extra Large</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Visibility Controls */}
          <div className="col-span-full">
            <Label className="mb-2 block">Visibility</Label>
            <div className="flex gap-4">
              <Button
                variant={section.visibility.mobile ? "default" : "outline"}
                onClick={() => onVisibilityChange(section.id, 'mobile')}
                className="flex items-center gap-2"
              >
                {section.visibility.mobile ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Mobile
              </Button>
              <Button
                variant={section.visibility.desktop ? "default" : "outline"}
                onClick={() => onVisibilityChange(section.id, 'desktop')}
                className="flex items-center gap-2"
              >
                {section.visibility.desktop ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Desktop
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
