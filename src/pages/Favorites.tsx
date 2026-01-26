import { useNavigate } from "react-router-dom";
import { Heart, Play, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useVideoLibrary } from "@/hooks/useVideoLibrary";
import { useSessionManager } from "@/hooks/useSessionManager";
import { VideoOptionsMenu } from "@/components/video/VideoOptionsMenu";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";

const Favorites = () => {
  const navigate = useNavigate();
  const { isAuthenticated, session, setIsAuthOpen } = useSessionManager();
  const userId = session?.user?.id;
  const { favorites, isLoading } = useVideoLibrary(userId);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-14 pl-[200px] bg-white flex flex-col">
        <div className="flex-1 max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6 shadow-sm">
              <Heart className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 font-friendly">Sign in to view your favorites</h1>
            <p className="text-gray-500 mb-6 max-w-md">
              Save your favorite videos to watch them anytime. Sign in to start building your collection.
            </p>
            <Button
              onClick={() => setIsAuthOpen(true)}
              className="rounded-full gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-3 font-semibold shadow-md hover:shadow-lg transition-all"
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
    <div className="min-h-screen pt-14 pl-[200px] bg-white flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-friendly">Favorites</h1>
            <p className="text-gray-500 mt-1">{favorites.length} video{favorites.length !== 1 ? "s" : ""} saved</p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-100 rounded-2xl mb-3" />
                <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6 shadow-sm">
              <Heart className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 font-friendly">No favorites yet</h2>
            <p className="text-gray-500 max-w-md">
              Start adding videos to your favorites by clicking the heart icon on any video.
            </p>
            <Button
              onClick={() => navigate('/videos')}
              className="mt-6 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 shadow-md hover:shadow-lg transition-all"
            >
              Browse Videos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/video/${item.video?.video_id}`)}
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                  <img
                    src={item.video?.thumbnail}
                    alt={item.video?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 text-gray-900 fill-gray-900 ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <VideoOptionsMenu videoId={item.video?.id} variant="overlay" />
                  </div>
                  {/* Favorite badge */}
                  <div className="absolute bottom-2 left-2">
                    <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
                      <Heart className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-1.5 group-hover:text-red-500 transition-colors">
                  {item.video?.title}
                </h3>
                <p className="text-xs text-gray-500">{item.video?.channel_name}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;
