
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export const WelcomeAnimation = () => {
  const [show, setShow] = useState(true);
  const [searchParams] = useSearchParams();
  const skipWelcome = searchParams.get("skipWelcome") === "true";

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .maybeSingle();
      
      return data;
    },
  });

  // Prefetch videos data
  const { isLoading: isLoadingVideos, isError } = useQuery({
    queryKey: ["youtube_videos"],
    queryFn: async () => {
      console.log("Prefetching videos during welcome animation...");
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .is('deleted_at', null)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching videos:", error);
        toast.error("Failed to load videos");
        throw error;
      }

      return (data || []).map(video => ({
        id: video.id,
        video_id: video.video_id,
        title: video.title,
        thumbnail: video.thumbnail,
        channelName: video.channel_name,
        channelId: video.channel_id,
        views: video.views || 0,
        uploadedAt: video.uploaded_at
      }));
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Prefetch channels data
  const { isLoading: isLoadingChannels } = useQuery({
    queryKey: ["youtube_channels"],
    queryFn: async () => {
      console.log("Prefetching channels during welcome animation...");
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*");

      if (error) {
        console.error("Error fetching channels:", error);
        return [];
      }

      return data || [];
    },
  });

  useEffect(() => {
    if (skipWelcome) {
      setShow(false);
      return;
    }

    if (!isLoadingVideos && !isLoadingChannels && !isLoadingProfile) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [skipWelcome, isLoadingVideos, isLoadingChannels, isLoadingProfile]);

  const userName = profile?.name || session?.user?.user_metadata?.full_name || "to YidVid";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-lg"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.3,
                }}
                className="text-5xl font-bold text-primary inline-block"
              >
                Welcome
              </motion.span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.5,
                }}
                className="text-5xl font-bold text-accent ml-3 inline-block"
              >
                {userName}
              </motion.span>
            </motion.div>
            
            <div className="relative w-32 h-32 mx-auto mb-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                  scale: [0.5, 1.1, 1],
                  opacity: 1,
                  rotate: [0, 10, 0]
                }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                  times: [0, 0.7, 1],
                  delay: 0.7
                }}
                className="relative w-full h-full"
              >
                <img
                  src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png"
                  alt="YidVid Logo"
                  className="w-full h-full object-contain"
                />
                <motion.div
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ 
                    scale: [1.2, 1],
                    opacity: [0, 0.2, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="absolute inset-0 bg-primary rounded-full -z-10"
                />
              </motion.div>
            </div>

            {(isLoadingVideos || isLoadingChannels || isLoadingProfile) && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-sm text-muted-foreground mt-4"
              >
                Loading content...
              </motion.p>
            )}

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-xl text-muted-foreground"
            >
              Your source for Jewish content
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
