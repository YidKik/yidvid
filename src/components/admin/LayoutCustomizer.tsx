
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LayoutConfig, SpacingProperty, VisibilityDevice } from "./layout/types";
import { SectionCard } from "./layout/SectionCard";
import { LivePreview } from "./layout/LivePreview";

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

      if (error) {
        console.error('Error loading layout config:', error);
        throw error;
      }
      
      // Transform the raw data to ensure proper typing
      const transformedData: LayoutConfig[] = (data || []).map(section => {
        // Ensure spacing has the correct structure
        const defaultSpacing = {
          marginTop: 'mt-0',
          marginBottom: 'mb-0',
          padding: 'p-0'
        };

        const rawSpacing = section.spacing as any;
        const spacing = {
          marginTop: typeof rawSpacing?.marginTop === 'string' ? rawSpacing.marginTop : defaultSpacing.marginTop,
          marginBottom: typeof rawSpacing?.marginBottom === 'string' ? rawSpacing.marginBottom : defaultSpacing.marginBottom,
          padding: typeof rawSpacing?.padding === 'string' ? rawSpacing.padding : defaultSpacing.padding
        };

        // Ensure visibility has the correct structure
        const defaultVisibility = {
          mobile: true,
          desktop: true
        };

        const rawVisibility = section.visibility as any;
        const visibility = {
          mobile: typeof rawVisibility?.mobile === 'boolean' ? rawVisibility.mobile : defaultVisibility.mobile,
          desktop: typeof rawVisibility?.desktop === 'boolean' ? rawVisibility.desktop : defaultVisibility.desktop
        };

        return {
          id: section.id,
          name: section.name,
          mobile_order: section.mobile_order,
          desktop_order: section.desktop_order,
          spacing,
          visibility,
          created_at: section.created_at,
          updated_at: section.updated_at
        };
      });

      setSections(transformedData);
      console.log('Loaded sections:', transformedData); // Debug log
    } catch (error) {
      console.error('Error loading layout config:', error);
      toast.error('Failed to load layout configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = async (sectionId: string, type: 'mobile' | 'desktop', value: string) => {
    try {
      const order = parseInt(value);
      if (isNaN(order)) return;

      // Update local state first for immediate feedback
      setSections(currentSections => 
        currentSections.map(section => 
          section.id === sectionId 
            ? { ...section, [`${type}_order`]: order }
            : section
        )
      );

      const { error } = await supabase
        .from('layout_configurations')
        .update({
          [`${type}_order`]: order
        })
        .eq('id', sectionId);

      if (error) throw error;

      toast.success('Order updated successfully');
      loadLayoutConfig(); // Refresh to ensure consistency
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
      loadLayoutConfig(); // Revert to server state on error
    }
  };

  const handleSpacingChange = async (sectionId: string, property: SpacingProperty, value: string) => {
    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return;

      // Update local state first
      setSections(currentSections => 
        currentSections.map(s => 
          s.id === sectionId 
            ? { ...s, spacing: { ...s.spacing, [property]: value } }
            : s
        )
      );

      const { error } = await supabase
        .from('layout_configurations')
        .update({
          spacing: {
            ...section.spacing,
            [property]: value
          }
        })
        .eq('id', sectionId);

      if (error) throw error;

      toast.success('Spacing updated successfully');
      loadLayoutConfig();
    } catch (error) {
      console.error('Error updating spacing:', error);
      toast.error('Failed to update spacing');
      loadLayoutConfig();
    }
  };

  const handleVisibilityChange = async (sectionId: string, device: VisibilityDevice) => {
    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return;

      // Update local state first
      setSections(currentSections => 
        currentSections.map(s => 
          s.id === sectionId 
            ? { ...s, visibility: { ...s.visibility, [device]: !s.visibility[device] } }
            : s
        )
      );

      const { error } = await supabase
        .from('layout_configurations')
        .update({
          visibility: {
            ...section.visibility,
            [device]: !section.visibility[device]
          }
        })
        .eq('id', sectionId);

      if (error) throw error;

      toast.success('Visibility updated successfully');
      loadLayoutConfig();
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast.error('Failed to update visibility');
      loadLayoutConfig();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-lg">Loading layout customizer...</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <p className="text-lg">No layout sections found.</p>
        <p className="text-sm text-muted-foreground">Layout sections need to be configured in the database.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      {/* Controls Panel */}
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
                onOrderChange={handleOrderChange}
                onSpacingChange={handleSpacingChange}
                onVisibilityChange={handleVisibilityChange}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="w-1/2 overflow-y-auto bg-gray-50 p-6">
        <div className="sticky top-0 bg-white p-4 shadow-sm mb-6 rounded-lg">
          <h2 className="text-xl font-semibold">Live Preview</h2>
        </div>
        <LivePreview sections={sections} />
      </div>
    </div>
  );
};
