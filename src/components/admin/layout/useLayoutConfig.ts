
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LayoutConfig, SpacingProperty, VisibilityDevice } from "./types";

interface LayoutData {
  id: string;
  name: string;
  mobile_order: number;
  desktop_order: number;
  spacing: {
    marginTop: string;
    marginBottom: string;
    padding: string;
  } | null;
  visibility: {
    mobile: boolean;
    desktop: boolean;
  } | null;
  created_at: string;
  updated_at: string;
}

export const useLayoutConfig = () => {
  const [sections, setSections] = useState<LayoutConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

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
      
      const transformedData: LayoutConfig[] = (data as LayoutData[] || []).map(section => ({
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

  useEffect(() => {
    loadLayoutConfig();
  }, []);

  return {
    sections,
    loading,
    selectedSectionId,
    setSelectedSectionId,
    handleOrderChange,
    handleSpacingChange,
    handleVisibilityChange
  };
};
