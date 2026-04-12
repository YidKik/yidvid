import { useState, useRef, useEffect, useMemo } from "react";
import { Bell, Mail, GitPullRequest, UserPlus, MessageSquare, Video, X, ChevronRight, ExternalLink } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchParams } from "react-router-dom";

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

// Parse notification content to extract structured data
function parseNotificationContent(type: string, content: string) {
  if (type === "new_video") {
    // Format: "New video added: <title> from <channel>"
    const match = content.match(/^New video added:\s*(.+?)\s+from\s+(.+)$/);
    if (match) return { title: match[1], subtitle: match[2], label: "New Video" };
  }
  if (type === "new_channel_request") {
    // Format: "New channel request for <name>"
    const match = content.match(/^New channel request for\s+(.+)$/);
    if (match) return { title: match[1], subtitle: "Channel Request", label: "Request" };
  }
  if (type === "new_comment") {
    // Format: "New comment added by <email> on video <title>"
    const match = content.match(/^New comment added by\s+(.+?)\s+on video\s+(.+)$/);
    if (match) return { title: match[2], subtitle: match[1], label: "Comment" };
  }
  if (type === "new_contact_request") {
    return { title: content, subtitle: "Contact Form", label: "Contact" };
  }
  if (type === "new_user") {
    return { title: content, subtitle: "New Registration", label: "User" };
  }
  return { title: content, subtitle: "", label: "" };
}

const SECTION_CONFIG: Record<string, {
  icon: typeof Mail;
  color: string;
  bg: string;
  border: string;
  tab?: string;
  sectionLabel: string;
}> = {
  new_video:           { icon: Video,          color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", tab: "channels",  sectionLabel: "New Videos" },
  new_channel_request: { icon: GitPullRequest,  color: "text-sky-400",    bg: "bg-sky-500/10",    border: "border-sky-500/20",    tab: "requests",  sectionLabel: "Channel Requests" },
  new_comment:         { icon: MessageSquare,   color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",tab: "comments",  sectionLabel: "Comments" },
  new_contact_request: { icon: Mail,            color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  tab: "contacts",  sectionLabel: "Contact Requests" },
  new_user:            { icon: UserPlus,        color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   tab: "users",     sectionLabel: "New Users" },
};

const DEFAULT_CFG = { icon: Bell, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", tab: undefined as string | undefined, sectionLabel: "Other" };

const SECTION_ORDER = ["new_video", "new_channel_request", "new_comment", "new_contact_request", "new_user"];

export const AdminHeaderV2 = ({ pageTitle, pageDescription, profile, onTabChange }: AdminHeaderV2Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [, setSearchParams] = useSearchParams();

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

  const sections = useMemo(() => {
    const unread = notifications?.filter(n => !n.is_read) || [];
    const grouped: Record<string, AdminNotification[]> = {};
    for (const n of unread) {
      const key = SECTION_CONFIG[n.type] ? n.type : "_other";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(n);
    }
    const result: { type: string; items: AdminNotification[] }[] = [];
    for (const type of SECTION_ORDER) {
      if (grouped[type]?.length) result.push({ type, items: grouped[type] });
    }
    if (grouped["_other"]?.length) result.push({ type: "_other", items: grouped["_other"] });
    return result;
  }, [notifications]);

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
      setSearchParams({ tab: cfg.tab });
      setIsOpen(false);
    }
  };

  const handleSectionViewAll = (type: string) => {
    const cfg = SECTION_CONFIG[type];
    if (cfg?.tab && onTabChange) {
      onTabChange(cfg.tab);
      setSearchParams({ tab: cfg.tab });
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
            <span className="absolute top-1 right-1 w-[7px] h-[7px] rounded-full bg-[#ef4444] ring-2 ring-[#0f1117] animate-pulse" />
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

      {/* Notification popup */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div
            ref={popupRef}
            className="fixed z-[9999] w-[96vw] max-w-[1600px] bg-[#0d0e14] border border-[#2a2d3a] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", maxHeight: "90vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-[#1e2028] shrink-0 bg-[#0f1017]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#6366f1]/15">
                  <Bell className="w-5 h-5 text-[#818cf8]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Notification Center</h2>
                  <p className="text-[11px] text-[#565b6e] mt-0.5">
                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#818cf8] hover:text-[#a5b4fc] transition-colors font-semibold px-3 py-1.5 rounded-lg hover:bg-[#818cf8]/10"
                  >
                    Mark all as read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-white/5 text-[#565b6e] hover:text-[#8b8fa3] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1" style={{ maxHeight: "calc(90vh - 80px)" }}>
              {sections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-[#565b6e]">
                  <Bell className="w-14 h-14 mb-5 opacity-15" />
                  <p className="text-base font-semibold text-[#8b8fa3]">All caught up!</p>
                  <p className="text-sm mt-1">No new notifications</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {SECTION_ORDER.map(type => {
                      const cfg = SECTION_CONFIG[type] || DEFAULT_CFG;
                      const Icon = cfg.icon;
                      const sectionData = sections.find(s => s.type === type);
                      const items = sectionData?.items || [];
                      
                      return (
                        <div
                          key={type}
                          className={`bg-[#13141b] border ${items.length > 0 ? cfg.border : 'border-[#1e2028]'} rounded-xl flex flex-col min-h-[400px] transition-all ${items.length > 0 ? 'ring-1 ring-inset ring-white/[0.03]' : ''}`}
                        >
                          {/* Column header */}
                          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#1e2028]/60">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg ${cfg.bg}`}>
                                <Icon className={`w-4 h-4 ${cfg.color}`} />
                              </div>
                              <span className="text-[11px] font-bold text-[#c4c7d4] uppercase tracking-wider">
                                {cfg.sectionLabel}
                              </span>
                            </div>
                            {items.length > 0 && (
                              <span className={`text-[11px] font-bold ${cfg.color} ${cfg.bg} rounded-full px-2 py-0.5 leading-none`}>
                                {items.length}
                              </span>
                            )}
                          </div>

                          {/* Items */}
                          <div className="flex-1 overflow-y-auto max-h-[520px]">
                            {items.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-full py-12">
                                <Icon className={`w-8 h-8 ${cfg.color} opacity-15 mb-3`} />
                                <p className="text-[11px] text-[#4a4e5e] font-medium">No new {cfg.sectionLabel.toLowerCase()}</p>
                              </div>
                            ) : (
                              <div className="divide-y divide-[#1e2028]/30">
                                {items.slice(0, 12).map(n => {
                                  const parsed = parseNotificationContent(n.type, n.content);
                                  return (
                                    <button
                                      key={n.id}
                                      onClick={() => handleNotificationClick(n)}
                                      className="w-full flex flex-col gap-1 px-4 py-3 text-left transition-all hover:bg-white/[0.03] group cursor-pointer"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <p className="text-[12px] leading-snug text-white font-medium line-clamp-2 group-hover:text-[#a5b4fc] transition-colors">
                                          {parsed.title}
                                        </p>
                                        <ExternalLink className="w-3 h-3 text-[#4a4e5e] mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                      {parsed.subtitle && (
                                        <p className="text-[10px] text-[#6b7084] line-clamp-1">
                                          {type === "new_video" && <span className="text-violet-400/70">Channel: </span>}
                                          {type === "new_comment" && <span className="text-emerald-400/70">By: </span>}
                                          {parsed.subtitle}
                                        </p>
                                      )}
                                      <p className="text-[9px] text-[#3d4050] mt-0.5">
                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                      </p>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          {items.length > 0 && cfg.tab && (
                            <button
                              onClick={() => handleSectionViewAll(type)}
                              className={`px-4 py-3 border-t border-[#1e2028]/60 text-[11px] ${cfg.color} hover:brightness-125 font-semibold transition-all text-center shrink-0 flex items-center justify-center gap-1.5 hover:bg-white/[0.02]`}
                            >
                              View all {items.length > 12 ? `${items.length}` : ''} in {cfg.sectionLabel}
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </>
      )}
    </header>
  );
};
