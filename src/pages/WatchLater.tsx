import { useNavigate } from "react-router-dom";
import { Clock, Play, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useVideoLibrary } from "@/hooks/useVideoLibrary";
import { useSessionManager } from "@/hooks/useSessionManager";
import { VideoOptionsMenu } from "@/components/video/VideoOptionsMenu";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { cleanVideoTitle } from "@/lib/utils";

const WatchLater = () => {
  const navigate = useNavigate();
  const { isAuthenticated, session, setIsAuthOpen } = useSessionManager();
  const userId = session?.user?.id;
  const { watchLater, isLoading } = useVideoLibrary(userId);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-12 pl-0 lg:pl-[200px] bg-white flex flex-col pb-20 lg:pb-0">
        <div className="flex-1 max-w-6xl mx-auto px-4 lg:px-6 py-12">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-card bg-muted flex items-center justify-center mb-6 shadow-sm">
              <Clock className="w-10 h-10 lg:w-12 lg:h-12 text-brand" />
            </div>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-2 font-friendly">Sign in to view Watch Later</h1>
            <p className="text-sm lg:text-base text-muted-foreground mb-6 max-w-md">
              Save videos to watch later and never miss content you're interested in.
            </p>
            <Button
              onClick={() => setIsAuthOpen(true)}
              className="rounded-control gap-2 bg-primary hover:brightness-90 text-white px-8 py-3 font-semibold transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pl-0 lg:pl-[200px] bg-white flex flex-col pb-20 lg:pb-0">
      <div className="flex-1 max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8 pb-4 lg:pb-6 border-b border-border">
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-card bg-primary flex items-center justify-center shadow-raised">
            <Clock className="w-6 h-6 lg:w-8 lg:h-8 text-foreground" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground font-friendly">Watch Later</h1>
            <p className="text-sm text-muted-foreground mt-1">{watchLater.length} video{watchLater.length !== 1 ? "s" : ""} saved</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-card mb-3" />
                <div className="h-4 bg-muted rounded-badge w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : watchLater.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-card bg-muted flex items-center justify-center mb-6 shadow-sm">
              <Clock className="w-10 h-10 lg:w-12 lg:h-12 text-brand" />
            </div>
            <h2 className="text-lg lg:text-xl font-semibold text-foreground mb-2 font-friendly">No videos saved</h2>
            <p className="text-sm lg:text-base text-muted-foreground max-w-md">
              Save videos to watch later by clicking the clock icon on any video.
            </p>
            <Button
              onClick={() => navigate('/videos')}
              className="mt-6 rounded-control bg-primary hover:brightness-90 text-primary-foreground font-semibold px-6 transition-all"
            >
              Browse Videos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {watchLater.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/video/${item.video?.video_id}`)}
              >
                <div className="relative aspect-video rounded-card lg:rounded-card overflow-hidden bg-muted mb-2 lg:mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                  <img src={item.video?.thumbnail} alt={cleanVideoTitle(item.video?.title)} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 lg:w-6 lg:h-6 text-foreground fill-foreground ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <VideoOptionsMenu videoId={item.video?.id} variant="overlay" />
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-control bg-primary flex items-center justify-center shadow-sm">
                      <Clock className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-foreground" />
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-foreground line-clamp-2 text-xs lg:text-sm mb-1 lg:mb-2 group-hover:text-brand transition-colors">
                  {cleanVideoTitle(item.video?.title)}
                </h3>
                <p className="text-xs lg:text-xs text-muted-foreground">{item.video?.channel_name}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default WatchLater;
