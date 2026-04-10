import { useState, useRef, useEffect } from "react";
import { Bell, Mail, GitPullRequest, UserPlus, MessageSquare, Video, X, ChevronRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface AdminHeaderV2Props {
  pageTitle: string;
  pageDescription?: string;
  profile: any;
  onTabChange?: (tab: string) => void;
}

interface AdminNotification {
  id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const NOTIFICATION_CONFIG: Record<string, {
  icon: typeof Mail;
  color: string;
  bg: string;
  tab?: string;
  label: string;
  priority: "high" | "low";
}> = {
  new_contact_request: {
    icon: Mail,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    tab: "contacts",
    label: "Contact Request",
    priority: "high",
  },
  new_channel_request: {
    icon: GitPullRequest,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    tab: "channels",
    label: "Channel Request",
    priority: "high",
  },
  new_comment: {
    icon: MessageSquare,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    tab: "comments",
    label: "Comment",
    priority: "low",
  },
  new_video: {
    icon: Video,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    tab: "channels",
    label: "New Video",
    priority: "low",
  },
  new_user: {
    icon: UserPlus,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    tab: "users",
    label: "New User",
    priority: "low",
  },
};

const DEFAULT_CONFIG = {
  icon: Bell,
  color: "text-slate-400",
  bg: "bg-slate-500/10",
  label: "Notification",
  priority: "low" as const,
};

export const AdminHeaderV2 = ({ pageTitle, pageDescription, profile, onTabChange }: AdminHeaderV2Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ["admin-notifications-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as AdminNotification[];
    },
    refetchInterval: 30000,
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  // Split into high priority (contact/channel requests) and low priority (comments, videos, users)
  const highPriority = notifications?.filter(n => {
    const cfg = NOTIFICATION_CONFIG[n.type] || DEFAULT_CONFIG;
    return cfg.priority === "high" && !n.is_read;
  }) || [];

  const lowPriority = notifications?.filter(n => {
    const cfg = NOTIFICATION_CONFIG[n.type] || DEFAULT_CONFIG;
    return cfg.priority === "low" && !n.is_read;
  }) || [];

  const readNotifications = notifications?.filter(n => n.is_read).slice(0, 10) || [];

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    await supabase.from("admin_notifications").update({ is_read: true }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-notifications-list"] });
  };

  const markAllAsRead = async () => {
    await supabase.from("admin_notifications").update({ is_read: true }).eq("is_read", false);
    queryClient.invalidateQueries({ queryKey: ["admin-notifications-list"] });
  };

  const handleNotificationClick = (notification: AdminNotification) => {
    const cfg = NOTIFICATION_CONFIG[notification.type];
    markAsRead(notification.id);
    if (cfg?.tab && onTabChange) {
      onTabChange(cfg.tab);
      setIsOpen(false);
    }
  };

  const NotificationItem = ({ notification, compact }: { notification: AdminNotification; compact?: boolean }) => {
    const cfg = NOTIFICATION_CONFIG[notification.type] || DEFAULT_CONFIG;
    const Icon = cfg.icon;

    return (
      <button
        onClick={() => handleNotificationClick(notification)}
        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 group ${
          compact ? "opacity-60" : ""
        }`}
      >
        <div className={`mt-0.5 p-1.5 rounded-lg ${cfg.bg} shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-xs leading-relaxed ${notification.is_read ? "text-gray-500" : "text-gray-200"}`}>
            {notification.content}
          </p>
          <p className="text-[10px] text-gray-600 mt-0.5">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        {cfg.tab && (
          <ChevronRight className="w-3.5 h-3.5 text-gray-600 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    );
  };

  return (
    <header className="h-[60px] bg-[#0f1117] border-b border-[#1e2028] flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-[15px] font-semibold text-white leading-tight">{pageTitle}</h1>
        {pageDescription && (
          <p className="text-[11px] text-[#565b6e] mt-0.5">{pageDescription}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-lg hover:bg-[#1a1c25] transition-colors"
        >
          <Bell className="w-[18px] h-[18px] text-[#8b8fa3]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-[7px] h-[7px] rounded-full bg-[#ef4444] ring-2 ring-[#0f1117]" />
          )}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#1e2028]">
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-medium text-[#c4c7d4] leading-tight">
              {profile?.display_name || profile?.email?.split("@")[0] || "Admin"}
            </p>
            <p className="text-[10px] text-[#565b6e]">Administrator</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white font-semibold text-xs">
            {(profile?.display_name || profile?.email || "A")[0].toUpperCase()}
          </div>
        </div>
      </div>

      {/* Notification popup - centered overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
            />

            {/* Centered popup */}
            <motion.div
              ref={popupRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[440px] max-h-[70vh] bg-[#13141b] border border-[#2a2d3a] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2028]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#818cf8]" />
                  <h2 className="text-sm font-semibold text-white">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="bg-[#ef4444] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-[#818cf8] hover:text-[#a5b4fc] transition-colors font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-white/5 text-gray-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1">
                {highPriority.length === 0 && lowPriority.length === 0 && readNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <Bell className="w-8 h-8 mb-3 opacity-30" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <div>
                    {/* High priority - Contact & Channel requests */}
                    {highPriority.length > 0 && (
                      <div>
                        <p className="px-5 pt-3 pb-1 text-[10px] uppercase tracking-wider text-[#818cf8] font-semibold">
                          Action Required
                        </p>
                        {highPriority.map(n => (
                          <NotificationItem key={n.id} notification={n} />
                        ))}
                      </div>
                    )}

                    {/* Low priority - comments, videos, users */}
                    {lowPriority.length > 0 && (
                      <div>
                        <p className="px-5 pt-3 pb-1 text-[10px] uppercase tracking-wider text-gray-600 font-semibold">
                          Activity
                        </p>
                        {lowPriority.slice(0, 15).map(n => (
                          <NotificationItem key={n.id} notification={n} compact />
                        ))}
                      </div>
                    )}

                    {/* Previously read */}
                    {readNotifications.length > 0 && highPriority.length === 0 && lowPriority.length === 0 && (
                      <div>
                        <p className="px-5 pt-3 pb-1 text-[10px] uppercase tracking-wider text-gray-600 font-semibold">
                          Previous
                        </p>
                        {readNotifications.map(n => (
                          <NotificationItem key={n.id} notification={n} compact />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
