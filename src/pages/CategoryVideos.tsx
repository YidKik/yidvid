
import { Header } from "@/components/Header";
import { useParams, useNavigate } from "react-router-dom";
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
  const categoryInfo = id && categories[id as VideoCategory];

  const { data: videos, isLoading } = useQuery({
    queryKey: ["category-videos", id],
    queryFn: async () => {
      if (!id) throw new Error("Category ID is required");
      
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("category", id as VideoCategory)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!id && !!categoryInfo, // Only run query if we have a valid category
  });

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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-[300px] rounded-lg" />
            ))}
          </div>
        ) : videos && videos.length > 0 ? (
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
