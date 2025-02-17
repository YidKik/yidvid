
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/navigation/BackButton";
import { VideoCategoryManagement } from "@/components/dashboard/VideoCategoryManagement";
import { ChannelCategoryManagement } from "@/components/dashboard/ChannelCategoryManagement";
import { CustomCategoryManagement } from "@/components/dashboard/CustomCategoryManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CategoriesPage() {
  const { data: videos, isLoading: videosLoading, error: videosError, refetch: refetchVideos } = useQuery({
    queryKey: ["all-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching videos:", error);
        throw error;
      }

      return data || [];
    },
  });

  const { data: channels, isLoading: channelsLoading, error: channelsError, refetch: refetchChannels } = useQuery({
    queryKey: ["all-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .order("title", { ascending: true });

      if (error) {
        console.error("Error fetching channels:", error);
        throw error;
      }

      return data || [];
    },
  });

  const { data: customCategories, isLoading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useQuery({
    queryKey: ["custom-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching custom categories:", error);
        throw error;
      }

      return data || [];
    },
  });

  if (videosError || channelsError || categoriesError) {
    return (
      <div className="container mx-auto py-8">
        <BackButton />
        <div className="text-center text-red-500">
          Error loading data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <BackButton />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Category Management</h1>
        </div>

        <Tabs defaultValue="videos" className="space-y-8">
          <TabsList className="bg-muted p-1 rounded-full w-full sm:w-auto flex justify-center gap-2">
            <TabsTrigger 
              value="videos" 
              className="rounded-full px-8 py-2.5 data-[state=active]:shadow-lg transition-all duration-200"
            >
              Videos
            </TabsTrigger>
            <TabsTrigger 
              value="channels" 
              className="rounded-full px-8 py-2.5 data-[state=active]:shadow-lg transition-all duration-200"
            >
              Channels
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="rounded-full px-8 py-2.5 data-[state=active]:shadow-lg transition-all duration-200"
            >
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            {videosLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <VideoCategoryManagement videos={videos || []} onUpdate={() => refetchVideos()} />
            )}
          </TabsContent>

          <TabsContent value="channels">
            {channelsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <ChannelCategoryManagement channels={channels || []} onUpdate={() => {
                refetchChannels();
                refetchVideos();
              }} />
            )}
          </TabsContent>

          <TabsContent value="categories">
            {categoriesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <CustomCategoryManagement 
                categories={customCategories || []} 
                onUpdate={() => refetchCategories()} 
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
