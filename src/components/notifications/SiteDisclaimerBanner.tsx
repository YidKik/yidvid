
import React, { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const SiteDisclaimerBanner = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if the user has previously dismissed the disclaimer
  React.useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem("hasSeenDisclaimer");
    if (hasSeenDisclaimer) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("hasSeenDisclaimer", "true");
    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <Card className="mx-auto max-w-5xl mb-4 bg-gradient-to-r from-gray-900 to-black border border-gray-800 shadow-md rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white mb-1">
              Welcome to our beta release! 🎉
            </h3>
            <p className="text-sm text-gray-300">
              We're actively enhancing your experience with improvements to site layout, content filtering, and our video fetching system.
            </p>
            
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-800/50 px-2 h-8 text-xs flex items-center gap-1 rounded-full"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    <span>Show less</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>Learn more</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 pb-1 text-xs space-y-2 text-gray-300 bg-gray-800/50 p-3 rounded-lg mt-2">
                    <p>
                      <strong>Site Layout:</strong> We're optimizing the interface for both desktop and mobile to ensure a seamless experience across all devices.
                    </p>
                    <p>
                      <strong>Content Filtering:</strong> An automatic filtering system is under development to better organize and present content.
                    </p>
                    <p>
                      <strong>Video Fetching:</strong> We're implementing an automated system to fetch and display new videos as they're released.
                    </p>
                    <p>
                      <strong>Music Page:</strong> A comprehensive music section is in progress to bring you high-quality audio content.
                    </p>
                    <p>
                      <strong>Channel Expansion:</strong> We're working to add more channels and content sources to diversify your viewing options.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="mt-3 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 border-none text-white rounded-full shadow-sm"
                onClick={handleDismiss}
              >
                Got it, thanks!
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
