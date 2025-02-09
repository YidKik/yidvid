
'use client';

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ColorPreferences {
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  logoColor: string;
}

interface ColorContextType {
  colors: ColorPreferences;
  updateColors: (newColors: ColorPreferences) => Promise<void>;
  resetColors: () => Promise<void>;
}

const DEFAULT_COLORS = {
  backgroundColor: '#FFFFFF',
  textColor: '#030303',
  buttonColor: '#FF0000',
  logoColor: '#030303',
};

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<ColorPreferences>(DEFAULT_COLORS);

  useEffect(() => {
    loadUserPreferences();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        loadUserPreferences();
      } else if (event === 'SIGNED_OUT') {
        setColors(DEFAULT_COLORS);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--background-custom', colors.backgroundColor);
    document.documentElement.style.setProperty('--text-custom', colors.textColor);
    document.documentElement.style.setProperty('--button-custom', colors.buttonColor);
    document.documentElement.style.setProperty('--logo-custom', colors.logoColor);
  }, [colors]);

  const loadUserPreferences = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        toast.error("Failed to load preferences");
        return;
      }

      if (preferences) {
        setColors({
          backgroundColor: preferences.background_color,
          textColor: preferences.text_color,
          buttonColor: preferences.button_color,
          logoColor: preferences.logo_color,
        });
      }
    } catch (error) {
      console.error('Error in loadUserPreferences:', error);
      toast.error("Failed to load preferences");
    }
  };

  const updateColors = async (newColors: ColorPreferences) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error("Please sign in to save preferences");
      return;
    }

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          background_color: newColors.backgroundColor,
          text_color: newColors.textColor,
          button_color: newColors.buttonColor,
          logo_color: newColors.logoColor,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating preferences:', error);
        toast.error("Failed to save preferences");
        return;
      }

      setColors(newColors);
      toast.success("Preferences saved successfully");
    } catch (error) {
      console.error('Error in updateColors:', error);
      toast.error("Failed to save preferences");
    }
  };

  const resetColors = async () => {
    await updateColors(DEFAULT_COLORS);
  };

  return (
    <ColorContext.Provider value={{ colors, updateColors, resetColors }}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColors() {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error('useColors must be used within a ColorProvider');
  }
  return context;
}
