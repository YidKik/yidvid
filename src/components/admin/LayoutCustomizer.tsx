
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LayoutConfig, SpacingProperty, VisibilityDevice } from "./layout/types";
import { SectionCard } from "./layout/SectionCard";

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
      
      // Transform the JSON data to match our LayoutConfig type
      const transformedData = (data || []).map(section => ({
        ...section,
        spacing: section.spacing as LayoutConfig['spacing'],
        visibility: section.visibility as LayoutConfig['visibility']
      }));

      setSections(transformedData);
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

  const handleSpacingChange = (sectionId: string, property: SpacingProperty, value: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    updateSection(sectionId, {
      spacing: {
        ...section.spacing,
        [property]: value
      }
    });
  };

  const handleVisibilityChange = (sectionId: string, device: VisibilityDevice) => {
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
          <SectionCard
            key={section.id}
            section={section}
            onOrderChange={handleOrderChange}
            onSpacingChange={handleSpacingChange}
            onVisibilityChange={handleVisibilityChange}
          />
        ))}
      </div>
    </div>
  );
};
