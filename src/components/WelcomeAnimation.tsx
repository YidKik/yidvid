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
            
            <div className="relative w-48 h-48 mx-auto mb-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ 
                  scale: [0.5, 1.2, 1],
                  opacity: 1,
                  y: [20, -10, 0],
                  rotate: [0, 15, 0]
                }}
                transition={{
                  duration: 1.2,
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
                    opacity: [0, 0.3, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="absolute inset-0 bg-primary rounded-full -z-10"
                />
              </motion.div>

              <motion.div
                initial={{ scale: 0, opacity: 0, x: -50 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  opacity: [0, 1, 1],
                  x: [-50, 0, 0]
                }}
                transition={{
                  duration: 1,
                  delay: 1.2,
                  times: [0, 0.6, 1]
                }}
                className="absolute -bottom-4 -left-4 w-16 h-16"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full text-red-600"
                  fill="currentColor"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </motion.div>

              <motion.div
                initial={{ scale: 0, opacity: 0, x: 50 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  opacity: [0, 1, 1],
                  x: [50, 0, 0]
                }}
                transition={{
                  duration: 1,
                  delay: 1.4,
                  times: [0, 0.6, 1]
                }}
                className="absolute -bottom-4 -right-4 w-16 h-16"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full text-blue-600"
                  fill="currentColor"
                >
                  <path d="M21.2,10.95C20.44,15.86 20.61,17.7 18.56,19.95C16.86,21.85 14.34,22.84 12.18,20.8C10.33,19.05 11.87,16 9.84,13.95L8.02,12.17C7.27,11.5 6.06,13.8 5,12.6C4.05,11.56 5.68,10.39 4.93,9.12C4.26,7.95 2.61,8.24 2.06,6.89C1.71,5.96 1.69,4.96 2.03,4.03C2.42,2.95 3.16,2.19 4.27,2.03C7.59,1.62 9.13,4.77 11.5,7L12.7,8.21C13.54,9.06 14.47,8.95 15.26,8.24C16.76,6.84 17.75,5.07 19.72,4.17C20.73,3.69 22.1,4.86 21.95,6.03C21.79,7.5 21.57,9.09 21.2,10.95M5.05,4.03C4.44,4.18 4.03,4.82 4.15,5.41C4.27,6.07 4.97,6.5 5.64,6.39C6.34,6.31 6.89,5.59 6.74,4.9C6.62,4.26 5.86,3.88 5.05,4.03M5.72,11.62C6.13,10.93 6,10.07 5.44,9.5C4.85,8.96 4.04,8.89 3.41,9.36C2.21,10.25 3.63,12.16 5.08,11.71C5.31,11.71 5.5,11.64 5.72,11.62M9.74,4.43C9.5,4.03 9.12,3.75 8.63,3.71C7.6,3.63 6.97,4.47 6.91,5.4C6.84,6.22 7.36,7.27 8.31,7.29C9.38,7.34 10.31,5.85 9.74,4.43M13.37,16.41C14.88,15.72 12.96,13.43 11.94,14.56C11.35,15.24 12.39,16.82 13.37,16.41M18.11,6.84C17.23,6.5 16.42,7.31 15.95,7.96C16.4,8.79 17.36,9.38 18.28,8.87C19.04,8.46 18.92,7.17 18.11,6.84Z" />
                </svg>
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
