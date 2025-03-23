
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { LayoutConfig, SpacingProperty, VisibilityDevice } from "./types";

export const useLayoutData = () => {
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
      
      const transformedData: LayoutConfig[] = (data || []).map(section => {
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
      // Don't show toast for layout config loading error - only show in console
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

      // Show success toast only for admin actions (not loading content)
      console.log('Order updated successfully');
      
      loadLayoutConfig(); // Refresh to ensure consistency
    } catch (error) {
      console.error('Error updating order:', error);
      // Show error toast only for admin actions (not loading content)
      console.error('Failed to update order');
      loadLayoutConfig(); // Revert to server state on error
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

      // Show success toast only for admin actions (not loading content)
      console.log('Spacing updated successfully');
      
      loadLayoutConfig();
    } catch (error) {
      console.error('Error updating spacing:', error);
      // Show error toast only for admin actions (not loading content)
      console.error('Failed to update spacing');
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

      // Show success toast only for admin actions (not loading content)
      console.log('Visibility updated successfully');
      
      loadLayoutConfig();
    } catch (error) {
      console.error('Error updating visibility:', error);
      // Show error toast only for admin actions (not loading content)
      console.error('Failed to update visibility');
      loadLayoutConfig();
    }
  };

  return {
    sections,
    loading,
    handleOrderChange,
    handleSpacingChange,
    handleVisibilityChange
  };
};
