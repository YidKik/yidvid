
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LayoutConfig {
  id: string;
  name: string;
  mobile_order: number;
  desktop_order: number;
  spacing: {
    marginTop: string;
    marginBottom: string;
    padding: string;
  };
  visibility: {
    mobile: boolean;
    desktop: boolean;
  };
  created_at: string;
  updated_at: string;
}

export const LayoutCustomizer = () => {
  const [sections, setSections] = useState<LayoutConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLayoutConfig();
  }, []);

  const loadLayoutConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('layout_configurations')
        .select('*')
        .order('mobile_order', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error loading layout config:', error);
      toast.error('Failed to load layout configuration');
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (sectionId: string, updates: Partial<Omit<LayoutConfig, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { error } = await supabase
        .from('layout_configurations')
        .update(updates)
        .eq('id', sectionId);

      if (error) throw error;

      toast.success('Layout updated successfully');
      loadLayoutConfig();
    } catch (error) {
      console.error('Error updating layout:', error);
      toast.error('Failed to update layout');
    }
  };

  const handleOrderChange = (sectionId: string, type: 'mobile' | 'desktop', value: string) => {
    const order = parseInt(value);
    if (isNaN(order)) return;

    updateSection(sectionId, {
      [type === 'mobile' ? 'mobile_order' : 'desktop_order']: order
    });
  };

  const handleSpacingChange = (sectionId: string, property: keyof LayoutConfig['spacing'], value: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    updateSection(sectionId, {
      spacing: {
        ...section.spacing,
        [property]: value
      }
    });
  };

  const handleVisibilityChange = (sectionId: string, device: keyof LayoutConfig['visibility']) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    updateSection(sectionId, {
      visibility: {
        ...section.visibility,
        [device]: !section.visibility[device]
      }
    });
  };

  if (loading) {
    return <div>Loading layout customizer...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Layout Customization</h2>
      </div>

      <div className="grid gap-6">
        {sections.map((section) => (
          <Card key={section.id} className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{section.name}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mobile Order</Label>
                  <Input 
                    type="number" 
                    value={section.mobile_order}
                    onChange={(e) => handleOrderChange(section.id, 'mobile', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Desktop Order</Label>
                  <Input 
                    type="number" 
                    value={section.desktop_order}
                    onChange={(e) => handleOrderChange(section.id, 'desktop', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Top Margin</Label>
                  <Select 
                    onValueChange={(value) => handleSpacingChange(section.id, 'marginTop', value)} 
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
                    onValueChange={(value) => handleSpacingChange(section.id, 'marginBottom', value)}
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

                <div className="col-span-2">
                  <Label>Visibility</Label>
                  <div className="flex gap-4 mt-2">
                    <Button
                      variant={section.visibility.mobile ? "default" : "outline"}
                      onClick={() => handleVisibilityChange(section.id, 'mobile')}
                    >
                      Show on Mobile
                    </Button>
                    <Button
                      variant={section.visibility.desktop ? "default" : "outline"}
                      onClick={() => handleVisibilityChange(section.id, 'desktop')}
                    >
                      Show on Desktop
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
