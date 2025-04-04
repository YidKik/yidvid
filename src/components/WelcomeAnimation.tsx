
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, useLocation } from "react-router-dom";
import { LogoAnimation } from "./welcome/LogoAnimation";
import { WelcomeText } from "./welcome/WelcomeText";
import { useWelcomeData } from "@/hooks/useWelcomeData";
import { useVideos } from "@/hooks/video/useVideos";
import { useIsMobile } from "@/hooks/use-mobile";

export const WelcomeAnimation = () => {
  const [show, setShow] = useState(true); // Always start with showing
  const [infoShown, setInfoShown] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const skipWelcome = searchParams.get("skipWelcome") === "true";
  const isMobile = useIsMobile();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Pass an empty string as userName when session is null (user is signed out)
  const { isLoading: isWelcomeLoading, isError, userName } = useWelcomeData(session);
  const { 
    isLoading: isVideosLoading, 
    isFetching: isVideosFetching, 
    data: videos,
    error: videosError 
  } = useVideos();

  // Hide welcome animation faster
  useEffect(() => {
    if (skipWelcome || isError || videosError) {
      setShow(false);
      sessionStorage.setItem('hasVisited', 'true');
      return;
    }

    // Hide welcome animation quicker - don't wait for all videos to load
    const timer = setTimeout(() => {
      console.log("Auto-hiding welcome animation after short timeout");
      setShow(false);
      sessionStorage.setItem('hasVisited', 'true');
      
      // Show the information notification after a delay
      if (!localStorage.getItem('hasSeenInfoNotification') && !infoShown) {
        const hasVisitedWelcome = localStorage.getItem('hasVisitedWelcome');
        if (hasVisitedWelcome) {
          setInfoShown(true);
          const infoTimer = setTimeout(() => {
            const CustomNotification = (t: any) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`bg-white rounded-lg shadow-lg ${isMobile ? 'p-2 max-w-[85%] mx-auto' : 'p-4 max-w-lg mx-auto'}`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <img 
                    src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
                    alt="YidVid Logo" 
                    className={isMobile ? "w-10 h-10" : "w-24 h-24"}
                    onError={(e) => {
                      console.error('Logo failed to load:', e);
                      e.currentTarget.src = '/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png';
                    }}
                  />
                  <h3 className={isMobile ? "text-sm font-semibold" : "text-2xl font-semibold"}>Welcome to YidVid!</h3>
                  <p className={isMobile ? "text-xs text-gray-600 leading-tight" : "text-lg text-gray-600"}>
                    {isMobile ? "Create account to unlock all features!" : "Start exploring our curated collection of Jewish content. Create a free account to unlock all features!"}
                  </p>
                  <button
                    onClick={() => {
                      // Handle dismissal without relying on toast
                      document.getElementById('welcome-info-notification')?.remove();
                      localStorage.setItem('hasSeenInfoNotification', 'true');
                    }}
                    className={`bg-primary text-white ${isMobile ? "px-3 py-1 text-xs" : "px-4 py-3 text-lg"} rounded-md hover:bg-primary/90 transition-colors`}
                  >
                    Got it!
                  </button>
                </div>
              </motion.div>
            );
            
            // Create and append custom notification
            const container = document.createElement('div');
            container.id = 'welcome-info-notification';
            container.style.position = 'fixed';
            container.style.bottom = '20px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
            
            // Use React to render into container
            const root = document.createElement('div');
            container.appendChild(root);
            import('react-dom/client').then(({ createRoot }) => {
              const reactRoot = createRoot(root);
              reactRoot.render(<CustomNotification />);
            });
            
            // Auto-remove after 6 seconds
            setTimeout(() => {
              container.remove();
              localStorage.setItem('hasSeenInfoNotification', 'true');
            }, 6000);
            
          }, 500);
          return () => clearTimeout(infoTimer);
        }
      }
    }, 1500); // Fixed 1.5 second timeout

    return () => clearTimeout(timer);
  }, [skipWelcome, isWelcomeLoading, isVideosLoading, isVideosFetching, videos, isError, videosError, show, infoShown, isMobile]);

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
          transition={{ duration: 0.2 }}
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
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <WelcomeText userName={session ? userName : ""} />
            <LogoAnimation />

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
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
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
