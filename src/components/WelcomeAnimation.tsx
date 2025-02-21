
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
  const [show, setShow] = useState(() => {
    return !sessionStorage.getItem('hasVisited');
  });
  const [infoShown, setInfoShown] = useState(false);
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
  const { isLoading: isVideosLoading, isFetching: isVideosFetching, error: videosError } = useVideos();

  useEffect(() => {
    if (skipWelcome || isError || videosError) {
      setShow(false);
      sessionStorage.setItem('hasVisited', 'true');
      return;
    }

    if (!isWelcomeLoading && !isVideosLoading && !isVideosFetching && show) {
      console.log("All content loaded, preparing to hide welcome animation...");
      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem('hasVisited', 'true');
        
        // Show the information notification after a delay
        if (!localStorage.getItem('hasSeenInfoNotification') && !infoShown) {
          const hasVisitedWelcome = localStorage.getItem('hasVisitedWelcome');
          if (hasVisitedWelcome) {
            setInfoShown(true);
            const infoTimer = setTimeout(() => {
              toast.custom((t) => (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto"
                >
                  <div className="flex flex-col items-center text-center space-y-6">
                    <img 
                      src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png" 
                      alt="YidVid Logo" 
                      className="w-24 h-24"
                    />
                    <h3 className="text-2xl font-semibold">Welcome to YidVid!</h3>
                    <p className="text-lg text-gray-600">
                      Start exploring our curated collection of Jewish content. Create a free account to unlock all features!
                    </p>
                    <button
                      onClick={() => {
                        toast.dismiss(t);
                        localStorage.setItem('hasSeenInfoNotification', 'true');
                      }}
                      className="bg-primary text-white px-6 py-3 text-lg rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Got it!
                    </button>
                  </div>
                </motion.div>
              ), {
                duration: 10000, // Reduced from Infinity to 10 seconds
                onAutoClose: () => {
                  localStorage.setItem('hasSeenInfoNotification', 'true');
                }
              });
            }, 500);
            return () => clearTimeout(infoTimer);
          }
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [skipWelcome, isWelcomeLoading, isVideosLoading, isVideosFetching, isError, videosError, show, infoShown]);

  // Cleanup function to ensure body overflow is restored
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          onAnimationComplete={() => {
            if (!show) {
              document.body.style.overflow = 'auto';
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <WelcomeText userName={userName} />
            <LogoAnimation />

            {(isWelcomeLoading || isVideosLoading || isVideosFetching) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
