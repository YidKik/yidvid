
import { Header } from "@/components/Header";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VideoCard } from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

type VideoCategory = "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other";

const categories: Record<VideoCategory, { label: string; icon: string }> = {
  music: { label: 'Music', icon: '🎵' },
  torah: { label: 'Torah', icon: '📖' },
  inspiration: { label: 'Inspiration', icon: '✨' },
  podcast: { label: 'Podcasts', icon: '🎙️' },
  education: { label: 'Education', icon: '📚' },
  entertainment: { label: 'Entertainment', icon: '🎬' },
  other: { label: 'Other', icon: '📌' }
};

const CategoryVideos = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const standardCategoryInfo = id && Object.keys(categories).includes(id) 
    ? categories[id as VideoCategory] 
    : null;

  const { data: customCategoryInfo, isLoading: isCustomCategoryLoading } = useQuery({
    queryKey: ["custom-category", id],
    queryFn: async () => {
      if (!id || standardCategoryInfo) return null;
      
      const { data, error } = await supabase
        .from("custom_categories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching custom category:", error);
        return null;
      }
      
      return data ? { label: data.name, icon: data.icon, is_emoji: data.is_emoji } : null;
    },
    enabled: !!id && !standardCategoryInfo,
  });

  const categoryInfo = standardCategoryInfo || customCategoryInfo;

  const { data: videos, isLoading } = useQuery({
    queryKey: ["category-videos", id],
    queryFn: async () => {
      if (!id) throw new Error("Category ID is required");
      
      if (standardCategoryInfo) {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("category", id as VideoCategory)
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false });

        if (error) throw error;
        return data || [];
      } 
      else if (customCategoryInfo) {
        const { data, error } = await supabase
          .from("video_custom_category_mappings")
          .select(`
            video_id,
            youtube_videos!inner(*)
          `)
          .eq("category_id", id)
          .is("youtube_videos.deleted_at", null)
          .order("youtube_videos.uploaded_at", { ascending: false });

        if (error) throw error;
        return data?.map(item => item.youtube_videos) || [];
      }
      
      return [];
    },
    enabled: !!id && !!categoryInfo,
  });

  if (isCustomCategoryLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-40 mx-auto" />
            <Skeleton className="h-5 w-20 mx-auto mt-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-[300px] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!categoryInfo) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-center">Category not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-4xl mb-4 block">{categoryInfo.icon}</span>
            <h1 className="text-3xl font-bold">{categoryInfo.label} Videos</h1>
            {videos && (
              <p className="text-gray-600 mt-2">{videos.length} videos found</p>
            )}
          </motion.div>
        </div>

        {videos && videos.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.video_id}
                uuid={video.id}
                title={video.title}
                thumbnail={video.thumbnail}
                channelName={video.channel_name}
                channelId={video.channel_id}
                views={video.views}
                uploadedAt={video.uploaded_at}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No videos found in this category</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryVideos;
