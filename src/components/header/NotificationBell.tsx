
import { useState } from "react";
import { createPortal } from "react-dom";
import { Bell, X, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscriptionNotifications } from "@/hooks/useSubscriptionNotifications";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { session } = useSessionManager();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useSubscriptionNotifications();

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const handleVideoClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    navigate(`/video/${notification.video?.video_id}`);
    setIsOpen(false);
  };

  // Don't show for non-authenticated users
  if (!session) {
    return null;
  }

  return (
    <>
      {/* Bell Button with Badge */}
      <Button
        variant="default"
        size="icon"
        onClick={toggleNotifications}
        className="h-9 w-9 rounded-full relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </Button>

      {/* Notifications Panel */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50"
                onClick={() => setIsOpen(false)}
              />

              {/* Notifications Panel - slides from right */}
              <motion.div
                initial={{ x: 320 }}
                animate={{ x: 0 }}
                exit={{ x: 320 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed right-0 top-[80px] z-50 w-80 max-h-[70vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl rounded-l-3xl border-2 border-red-400 overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                      New Videos
                    </h2>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAllAsRead()}
                          className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark all read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                        className="h-7 w-7 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                    From channels you follow
                  </p>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">Loading...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                        No new videos yet
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Subscribe to channels to get notified
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {notifications.map((notification) => (
                        <motion.button
                          key={notification.id}
                          onClick={() => handleVideoClick(notification)}
                          className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                            !notification.is_read ? "bg-red-50/50 dark:bg-red-900/10" : ""
                          }`}
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex gap-3">
                            {/* Thumbnail */}
                            {notification.video?.thumbnail && (
                              <div className="relative flex-shrink-0">
                                <img
                                  src={notification.video.thumbnail}
                                  alt={notification.video.title}
                                  className="w-20 h-12 object-cover rounded-lg"
                                />
                                {!notification.is_read && (
                                  <span className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full" />
                                )}
                              </div>
                            )}
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p 
                                className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2"
                                style={{ fontFamily: "'Quicksand', sans-serif" }}
                              >
                                {notification.video?.title || "Video"}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {notification.video?.channel_name}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
