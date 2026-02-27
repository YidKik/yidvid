
import { useState } from "react";
import { createPortal } from "react-dom";
import { Bell, X, Check, Clock, LogIn } from "lucide-react";
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

  const isLoggedIn = !!session;

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

  return (
    <>
      {/* Bell Button */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={toggleNotifications}
          className="h-10 w-10 rounded-full relative border-2 border-[#FF0000] bg-white hover:bg-[#F0F0F0] shadow-md"
        >
          <Bell className="h-5 w-5 text-[#FF0000]" />
          {isLoggedIn && unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#FF0000] text-white text-xs font-bold flex items-center justify-center shadow-lg"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </Button>
      </motion.div>

      {/* Notifications Panel */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50"
                onClick={() => setIsOpen(false)}
              />

              <motion.div
                initial={{ x: 320 }}
                animate={{ x: 0 }}
                exit={{ x: 320 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed right-0 top-[80px] z-50 w-80 max-h-[70vh] bg-white shadow-2xl rounded-l-3xl border-2 border-[#FF0000] overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="p-4 border-b border-[#E5E5E5] bg-[#F5F5F5]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-[#FF0000]" />
                      <h2 className="text-lg font-semibold text-[#1A1A1A]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                        New Videos
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLoggedIn && unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAllAsRead()}
                          className="text-xs text-[#FF0000] hover:text-[#FF0000] hover:bg-[#F0F0F0]"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark all read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                        className="h-7 w-7 rounded-full hover:bg-[#F0F0F0]"
                      >
                        <X className="h-4 w-4 text-[#FF0000]" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-[#999999] mt-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                    From channels you follow
                  </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  {!isLoggedIn ? (
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-4">
                        <LogIn className="h-8 w-8 text-[#FF0000]" />
                      </div>
                      <h3 className="text-base font-semibold text-[#1A1A1A] mb-2" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                        Sign in to get notified
                      </h3>
                      <p className="text-sm text-[#666666] mb-4">
                        Subscribe to your favorite channels and never miss a new video!
                      </p>
                      <Button
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/auth');
                        }}
                        className="bg-[#FF0000] hover:brightness-90 text-white"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </div>
                  ) : isLoading ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin h-6 w-6 border-2 border-[#FF0000] border-t-transparent rounded-full mx-auto" />
                      <p className="text-sm text-[#666666] mt-2">Loading...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-4">
                        <Bell className="h-8 w-8 text-[#999999]" />
                      </div>
                      <h3 className="text-base font-semibold text-[#1A1A1A] mb-2" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                        No new videos yet
                      </h3>
                      <p className="text-sm text-[#666666]">
                        Subscribe to channels to get notified when new videos are uploaded
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E5E5E5]">
                      {notifications.map((notification) => (
                        <motion.button
                          key={notification.id}
                          onClick={() => handleVideoClick(notification)}
                          className={`w-full p-3 text-left hover:bg-[#F0F0F0] transition-colors ${
                            !notification.is_read ? "bg-[#F5F5F5]" : ""
                          }`}
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex gap-3">
                            {notification.video?.thumbnail && (
                              <div className="relative flex-shrink-0">
                                <img
                                  src={notification.video.thumbnail}
                                  alt={notification.video.title}
                                  className="w-20 h-12 object-cover rounded-lg"
                                />
                                {!notification.is_read && (
                                  <span className="absolute top-1 left-1 w-2 h-2 bg-[#FF0000] rounded-full animate-pulse" />
                                )}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p 
                                className="text-sm font-medium text-[#1A1A1A] line-clamp-2"
                                style={{ fontFamily: "'Quicksand', sans-serif" }}
                              >
                                {notification.video?.title || "Video"}
                              </p>
                              <p className="text-xs text-[#666666] mt-0.5">
                                {notification.video?.channel_name}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-[#999999] mt-1">
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
