
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CategoryStats, VideoCategory, validCategories } from "./channelCategoryTypes";

export const useChannelQueries = (searchQuery: string, categoryFilter: string) => {
  const { data: channels = [], isLoading } = useQuery({
    queryKey: ["admin-channels-bulk", searchQuery, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("youtube_channels")
        .select("*")
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });

      if (searchQuery.trim()) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      if (categoryFilter && categoryFilter !== "all") {
        if (categoryFilter === 'no_category') {
          query = query.is("default_category", null);
        } else {
          // Ensure the categoryFilter is a valid VideoCategory before using it
          if (validCategories.includes(categoryFilter as VideoCategory)) {
            query = query.eq("default_category", categoryFilter as VideoCategory);
          }
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: categoryStats = [] } = useQuery({
    queryKey: ["category-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("default_category")
        .is("deleted_at", null);

      if (error) throw error;

      const stats: CategoryStats[] = [];
      const counts = data.reduce((acc, channel) => {
        const category = channel.default_category || 'no_category';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      validCategories.forEach(cat => {
        stats.push({ category: cat, count: counts[cat] || 0 });
      });
      stats.push({ category: 'no_category', count: counts['no_category'] || 0 });

      return stats;
    },
  });

  return {
    channels,
    isLoading,
    categoryStats,
  };
};
