
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { LogoAnimation } from "./welcome/LogoAnimation";
import { WelcomeText } from "./welcome/WelcomeText";
import { useWelcomeData } from "@/hooks/useWelcomeData";

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

  const { isLoading, userName } = useWelcomeData(session);

  useEffect(() => {
    if (skipWelcome) {
      setShow(false);
      return;
    }

    if (!isLoading) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [skipWelcome, isLoading]);

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

            {isLoading && (
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
