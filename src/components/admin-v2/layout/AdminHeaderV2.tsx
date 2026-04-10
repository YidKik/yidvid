import { useState, useRef, useEffect, useMemo } from "react";
import { Bell, Mail, GitPullRequest, UserPlus, MessageSquare, Video, X, ChevronRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const SECTION_CONFIG: Record<string, {
  icon: typeof Mail;
  color: string;
  bg: string;
  tab?: string;
  sectionLabel: string;
}> = {
  new_contact_request: { icon: Mail, color: "text-amber-400", bg: "bg-amber-500/10", tab: "contacts", sectionLabel: "Contact Requests" },
  new_channel_request: { icon: GitPullRequest, color: "text-sky-400", bg: "bg-sky-500/10", tab: "requests", sectionLabel: "Channel Requests" },
  new_video: { icon: Video, color: "text-violet-400", bg: "bg-violet-500/10", tab: "channels", sectionLabel: "New Videos" },
  new_comment: { icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-500/10", tab: "comments", sectionLabel: "Comments" },
  new_user: { icon: UserPlus, color: "text-blue-400", bg: "bg-blue-500/10", tab: "users", sectionLabel: "New Users" },
};

const DEFAULT_CFG = { icon: Bell, color: "text-slate-400", bg: "bg-slate-500/10", tab: undefined as string | undefined, sectionLabel: "Other" };

// Section display order
const SECTION_ORDER = ["new_contact_request", "new_channel_request", "new_video", "new_comment", "new_user"];

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
        .limit(100);
      if (error) throw error;
      return (data || []) as AdminNotification[];
    },
    refetchInterval: 30000,
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  // Group unread notifications by type into sections
  const sections = useMemo(() => {
    const unread = notifications?.filter(n => !n.is_read) || [];
    const grouped: Record<string, AdminNotification[]> = {};
    for (const n of unread) {
      const key = SECTION_CONFIG[n.type] ? n.type : "_other";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(n);
    }
    // Return in defined order
    const result: { type: string; items: AdminNotification[] }[] = [];
    for (const type of SECTION_ORDER) {
      if (grouped[type]?.length) result.push({ type, items: grouped[type] });
    }
    if (grouped["_other"]?.length) result.push({ type: "_other", items: grouped["_other"] });
    return result;
  }, [notifications]);

  const readNotifications = useMemo(() => notifications?.filter(n => n.is_read).slice(0, 8) || [], [notifications]);

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

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
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
    const cfg = SECTION_CONFIG[notification.type];
    markAsRead(notification.id);
    if (cfg?.tab && onTabChange) {
      onTabChange(cfg.tab);
      setIsOpen(false);
    }
  };

  const handleSectionClick = (type: string) => {
    const cfg = SECTION_CONFIG[type];
    if (cfg?.tab && onTabChange) {
      onTabChange(cfg.tab);
      setIsOpen(false);
    }
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

      {/* Notification popup — fixed center using portal-style positioning */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={() => setIsOpen(false)}
          />

          {/* Centered popup — wide multi-column layout */}
          <div
            ref={popupRef}
            className="fixed z-[9999] w-[90vw] max-w-[1100px] max-h-[80vh] bg-[#13141b] border border-[#2a2d3a] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2028] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#6366f1]/10">
                  <Bell className="w-4 h-4 text-[#818cf8]" />
                </div>
                <h2 className="text-sm font-semibold text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-[#ef4444] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-[#818cf8] hover:text-[#a5b4fc] transition-colors font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-[#565b6e] hover:text-[#8b8fa3] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content — grid of columns */}
            <ScrollArea className="flex-1">
              {sections.length === 0 && readNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#565b6e]">
                  <Bell className="w-10 h-10 mb-4 opacity-20" />
                  <p className="text-sm font-medium text-[#8b8fa3]">All caught up!</p>
                  <p className="text-xs mt-1">No new notifications</p>
                </div>
              ) : (
                <div className="p-4">
                  {/* All sections as columns in a grid */}
                  {(() => {
                    // Build all columns: one per section type (even if empty)
                    const allSectionTypes = SECTION_ORDER;
                    const sectionMap: Record<string, AdminNotification[]> = {};
                    for (const s of sections) sectionMap[s.type] = s.items;

                    return (
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                        {allSectionTypes.map(type => {
                          const cfg = SECTION_CONFIG[type] || DEFAULT_CFG;
                          const Icon = cfg.icon;
                          const items = sectionMap[type] || [];
                          return (
                            <div
                              key={type}
                              className="bg-[#1a1c25]/60 border border-[#1e2028] rounded-xl flex flex-col min-h-[200px]"
                            >
                              {/* Column header */}
                              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1e2028]">
                                <div className="flex items-center gap-1.5">
                                  <div className={`p-1 rounded-md ${cfg.bg}`}>
                                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                                  </div>
                                  <span className="text-[10px] font-semibold text-[#c4c7d4] uppercase tracking-wide">
                                    {cfg.sectionLabel}
                                  </span>
                                </div>
                                {items.length > 0 && (
                                  <span className="text-[10px] font-bold text-[#565b6e] bg-[#0f1117] rounded-full px-1.5 py-0.5 leading-none">
                                    {items.length}
                                  </span>
                                )}
                              </div>

                              {/* Column items */}
                              <div className="flex-1 overflow-y-auto max-h-[340px]">
                                {items.length === 0 ? (
                                  <div className="flex items-center justify-center h-full py-8">
                                    <p className="text-[10px] text-[#4a4e5e]">No notifications</p>
                                  </div>
                                ) : (
                                  <div className="divide-y divide-[#1e2028]/40">
                                    {items.slice(0, 8).map(n => (
                                      <button
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className="w-full flex items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-white/[0.04] group"
                                      >
                                        <div className="min-w-0 flex-1">
                                          <p className="text-[11px] leading-relaxed text-[#c4c7d4] line-clamp-2">
                                            {n.content}
                                          </p>
                                          <p className="text-[9px] text-[#4a4e5e] mt-0.5">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                          </p>
                                        </div>
                                        <ChevronRight className="w-3 h-3 text-[#4a4e5e] mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Footer link */}
                              {items.length > 0 && cfg.tab && (
                                <button
                                  onClick={() => handleSectionClick(type)}
                                  className="px-3 py-2 border-t border-[#1e2028] text-[10px] text-[#818cf8] hover:text-[#a5b4fc] font-medium transition-colors text-center shrink-0"
                                >
                                  {items.length > 8 ? `View all ${items.length} →` : "View all →"}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </ScrollArea>
          </div>
        </>
      )}
    </header>
  );
};
