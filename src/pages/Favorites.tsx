import { useNavigate } from "react-router-dom";
import { Heart, Play, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useVideoLibrary } from "@/hooks/useVideoLibrary";
import { useSessionManager } from "@/hooks/useSessionManager";
import { VideoOptionsMenu } from "@/components/video/VideoOptionsMenu";
import { Button } from "@/components/ui/button";

const Favorites = () => {
  const navigate = useNavigate();
  const { isAuthenticated, session, setIsAuthOpen } = useSessionManager();
  const userId = session?.user?.id;
  const { favorites, isLoading } = useVideoLibrary(userId);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-14 pl-[200px] bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Sign in to view your favorites</h1>
            <p className="text-gray-500 mb-6 max-w-md">
              Save your favorite videos to watch them anytime. Sign in to start building your collection.
            </p>
            <Button
              onClick={() => setIsAuthOpen(true)}
              className="rounded-full gap-2 bg-red-500 hover:bg-red-600 text-white px-6"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 pl-[200px] bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
            <Heart className="w-7 h-7 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
            <p className="text-gray-500">{favorites.length} video{favorites.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-xl mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No favorites yet</h2>
            <p className="text-gray-500 max-w-md">
              Start adding videos to your favorites by clicking the heart icon on any video.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favorites.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/video/${item.video?.video_id}`)}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 mb-3">
                  <img
                    src={item.video?.thumbnail}
                    alt={item.video?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-12 h-12 rounded-full bg-black/70 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <VideoOptionsMenu videoId={item.video?.id} variant="overlay" />
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 line-clamp-2 text-sm mb-1 group-hover:text-red-600 transition-colors">
                  {item.video?.title}
                </h3>
                <p className="text-xs text-gray-500">{item.video?.channel_name}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
