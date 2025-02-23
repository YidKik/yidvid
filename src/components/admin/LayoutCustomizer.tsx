import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LayoutConfig, SpacingProperty, VisibilityDevice } from "./layout/types";
import { SectionCard } from "./layout/SectionCard";
import { LivePreview } from "./layout/LivePreview";

export const LayoutCustomizer = () => {
  const [sections, setSections] = useState<LayoutConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

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
      
      const transformedData: LayoutConfig[] = (data || []).map(section => ({
        id: section.id,
        name: section.name,
        mobile_order: section.mobile_order,
        desktop_order: section.desktop_order,
        spacing: {
          marginTop: section.spacing?.marginTop || 'mt-0',
          marginBottom: section.spacing?.marginBottom || 'mb-0',
          padding: section.spacing?.padding || 'p-0'
        },
        visibility: {
          mobile: section.visibility?.mobile ?? true,
          desktop: section.visibility?.desktop ?? true
        },
        created_at: section.created_at,
        updated_at: section.updated_at
      }));

      setSections(transformedData);
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
      loadLayoutConfig();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
      loadLayoutConfig();
    }
  };

  const handleSpacingChange = async (sectionId: string, property: SpacingProperty, value: string) => {
    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return;

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

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      {/* Controls Panel */}
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
                onOrderChange={handleOrderChange}
                onSpacingChange={handleSpacingChange}
                onVisibilityChange={handleVisibilityChange}
              />
            </div>
          ) : (
            <p className="text-muted-foreground">Select a section on the right to customize it</p>
          )}
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="w-2/3 overflow-y-auto bg-gray-50">
        <div className="sticky top-0 bg-white p-4 shadow-sm mb-6">
          <h2 className="text-xl font-semibold">Live Preview</h2>
          <p className="text-sm text-muted-foreground mt-1">Click on any section to customize it</p>
        </div>
        <div className="p-6">
          <LivePreview 
            sections={sections} 
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
          />
        </div>
      </div>
    </div>
  );
};
