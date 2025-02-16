
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { LogoAnimation } from "./welcome/LogoAnimation";
import { WelcomeText } from "./welcome/WelcomeText";
import { useWelcomeData } from "@/hooks/useWelcomeData";
import { useVideos } from "@/hooks/video/useVideos";
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

  const { isLoading: isWelcomeLoading, isError, userName } = useWelcomeData(session);
  const { isLoading: isVideosLoading, isFetching: isVideosFetching } = useVideos();

  useEffect(() => {
    if (skipWelcome) {
      setShow(false);
      return;
    }

    if (isError) {
      toast.error("Failed to load content. Please refresh the page.");
    }

    // Only hide welcome animation when both welcome data and videos are loaded
    if (!isWelcomeLoading && !isVideosLoading && !isVideosFetching) {
      console.log("All content loaded, hiding welcome animation...");
      const timer = setTimeout(() => {
        setShow(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [skipWelcome, isWelcomeLoading, isVideosLoading, isVideosFetching, isError]);

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
            <WelcomeText userName={userName} />
            <LogoAnimation />

            {(isWelcomeLoading || isVideosLoading || isVideosFetching) && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center gap-2 mt-4"
              >
                <p className="text-sm text-muted-foreground">Loading content...</p>
                <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    animate={{
                      width: ["0%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
              </motion.div>
            )}

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-xl text-muted-foreground mt-4"
            >
              Your source for Jewish content
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
