
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomCategory } from "@/types/custom-categories";

interface Category {
  id: string;
  label: string;
  icon: string;
  isCustom?: boolean;
  is_emoji?: boolean;
}

export const defaultCategories: Category[] = [
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'torah', label: 'Torah', icon: '📖' },
  { id: 'inspiration', label: 'Inspiration', icon: '✨' },
  { id: 'podcast', label: 'Podcasts', icon: '🎙️' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'other', label: 'Other', icon: '📌' },
];

export interface UseCategories {
  allCategories: Category[];
  infiniteCategories: Category[];
  categoriesLoading: boolean;
  refetchVideos: () => Promise<any>;
}

export const useCategories = (): UseCategories => {
  const { data: categoryVideos, refetch: refetchVideos } = useQuery({
    queryKey: ["category-videos"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .is('deleted_at', null)
          .order("uploaded_at", { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching videos:', error);
        return [];
      }
    },
  });

  const { data: customCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["custom-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const allCategories: Category[] = [
    ...defaultCategories,
    ...(customCategories?.map(cat => ({
      id: cat.id,
      label: cat.name,
      icon: cat.icon,
      isCustom: true,
      is_emoji: cat.is_emoji
    })) || [])
  ];

  // Create infiniteCategories by repeating the allCategories array to create a continuous scrolling effect
  const infiniteCategories = [...allCategories, ...allCategories, ...allCategories];

  return {
    allCategories,
    infiniteCategories,
    categoriesLoading,
    refetchVideos
  };
};
