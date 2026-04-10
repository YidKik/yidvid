import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GitPullRequest, Mail, MessageSquare, Play, Heart, Tv, Clock,
  ExternalLink, Eye, Activity, BarChart3, User
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface UserActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onNavigate?: (tab: string) => void;
}

export const UserActivityDialog = ({ open, onOpenChange, userId, userName }: UserActivityDialogProps) => {
  const navigate = useNavigate();

  const { data: channelRequests, isLoading: loadingCR } = useQuery({
    queryKey: ["user-activity-channel-requests", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("channel_requests")
        .select("id, channel_name, channel_id, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: open,
  });

  const { data: contactRequests, isLoading: loadingContact } = useQuery({
    queryKey: ["user-activity-contact-requests", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("contact_requests")
        .select("id, name, email, category, status, message, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: open,
  });

  const { data: comments, isLoading: loadingComments } = useQuery({
    queryKey: ["user-activity-comments", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("video_comments")
        .select("id, content, created_at, video_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: open,
  });

  const { data: subscriptions, isLoading: loadingSubs } = useQuery({
    queryKey: ["user-activity-subscriptions", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("channel_subscriptions")
        .select("id, channel_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!data?.length) return [];
      const channelIds = [...new Set(data.map(s => s.channel_id))];
      const { data: channels } = await supabase
        .from("youtube_channels")
        .select("channel_id, title, thumbnail_url")
        .in("channel_id", channelIds);
      const channelMap = new Map(channels?.map(c => [c.channel_id, c]) || []);
      return data.map(s => ({ ...s, channel: channelMap.get(s.channel_id) }));
    },
    enabled: open,
  });

  const { data: videoStats, isLoading: loadingVideos } = useQuery({
    queryKey: ["user-activity-video-stats", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("video_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { data: recent } = await supabase
        .from("video_history")
        .select("video_id, watched_at")
        .eq("user_id", userId)
        .order("watched_at", { ascending: false })
        .limit(20);

      let recentVideos: any[] = [];
      if (recent?.length) {
        const videoIds = recent.map(r => r.video_id);
        const { data: videos } = await supabase
          .from("youtube_videos")
          .select("id, title, channel_name, thumbnail, video_id")
          .in("id", videoIds);
        const videoMap = new Map(videos?.map(v => [v.id, v]) || []);
        recentVideos = recent.map(r => ({ ...r, video: videoMap.get(r.video_id) }));
      }

      const { data: allHistory } = await supabase
        .from("video_history")
        .select("video_id")
        .eq("user_id", userId);

      let uniqueChannels = 0;
      if (allHistory?.length) {
        const vIds = [...new Set(allHistory.map(h => h.video_id))];
        const { data: vids } = await supabase
          .from("youtube_videos")
          .select("channel_id")
          .in("id", vIds.slice(0, 500));
        uniqueChannels = new Set(vids?.map(v => v.channel_id) || []).size;
      }

      return {
        totalWatched: count || 0,
        lastWatched: recent?.[0]?.watched_at || null,
        recentVideos,
        uniqueChannels,
      };
    },
    enabled: open,
  });

  const { data: favorites, isLoading: loadingFavs } = useQuery({
    queryKey: ["user-activity-favorites", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("user_video_interactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("interaction_type", "like");
      return count || 0;
    },
    enabled: open,
  });

  const { data: sessionData } = useQuery({
    queryKey: ["user-activity-sessions", userId],
    queryFn: async () => {
      const { data, count } = await supabase
        .from("user_analytics")
        .select("session_start, session_end, page_path", { count: "exact" })
        .eq("user_id", userId)
        .order("session_start", { ascending: false })
        .limit(500);

      let totalMinutes = 0;
      let isLive = false;
      (data || []).forEach(s => {
        if (s.session_start && s.session_end) {
          const diff = (new Date(s.session_end).getTime() - new Date(s.session_start).getTime()) / 60000;
          if (diff > 0 && diff < 480) totalMinutes += diff;
        }
        // User is "live" if they have a session with no end, or session_end updated within last 2 minutes
        if (s.session_start && !s.session_end) {
          const startAge = (Date.now() - new Date(s.session_start).getTime()) / 60000;
          if (startAge < 480) isLive = true; // session started less than 8h ago with no end
        } else if (s.session_end) {
          const endAge = (Date.now() - new Date(s.session_end).getTime()) / 60000;
          if (endAge < 2) isLive = true; // heartbeat within last 2 minutes
        }
      });

      return {
        totalSessions: count || 0,
        totalMinutes: Math.round(totalMinutes),
        lastSession: data?.[0]?.session_start || null,
        isLive,
        currentPage: isLive ? data?.[0]?.page_path || null : null,
      };
    },
    enabled: open,
    refetchInterval: 30_000, // Refresh every 30s to update live status
  });

  const isLoading = loadingCR || loadingContact || loadingComments || loadingSubs || loadingVideos || loadingFavs;

  const statusColor = (status: string | null) => {
    switch (status) {
      case "approved": case "resolved": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
      case "rejected": return "bg-red-500/15 text-red-400 border-red-500/20";
      case "pending": return "bg-amber-500/15 text-amber-400 border-amber-500/20";
      default: return "bg-slate-500/15 text-slate-400 border-slate-500/20";
    }
  };

  const SectionHeader = ({ icon: Icon, label, count, color }: { icon: any; label: string; count: number; color: string }) => (
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-4 h-4 ${color}`} />
      <h3 className="text-sm font-semibold text-[#c4c7d4]">{label}</h3>
      <span className="text-[10px] font-bold text-[#565b6e] bg-[#1a1c25] rounded-full px-2 py-0.5 ml-auto">{count}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#13141b] border-[#2a2d3a] text-gray-200 max-w-[900px] max-h-[88vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-[#1e2028] shrink-0">
          <DialogTitle className="text-base font-semibold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-[#818cf8]" />
            Activity Overview — {userName}
            {sessionData?.isLive && (
              <span className="flex items-center gap-1.5 ml-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Online Now
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(88vh-70px)]">
          <div className="p-6">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 bg-[#1a1c25] rounded-xl" />)}
              </div>
            ) : (
              <>
                {/* Top stats bar */}
                <div className="grid grid-cols-6 gap-3 mb-6">
                  {[
                    { label: "Videos Watched", value: videoStats?.totalWatched || 0, icon: Play, color: "text-violet-400" },
                    { label: "Channels Explored", value: videoStats?.uniqueChannels || 0, icon: Tv, color: "text-blue-400" },
                    { label: "Subscriptions", value: subscriptions?.length || 0, icon: Activity, color: "text-cyan-400" },
                    { label: "Favorites", value: favorites || 0, icon: Heart, color: "text-pink-400" },
                    {
                      label: "Time on Site",
                      value: sessionData?.totalMinutes
                        ? sessionData.totalMinutes >= 60
                          ? `${Math.floor(sessionData.totalMinutes / 60)}h ${sessionData.totalMinutes % 60}m`
                          : `${sessionData.totalMinutes}m`
                        : "—",
                      icon: Clock,
                      color: "text-amber-400",
                    },
                    {
                      label: "Status",
                      value: sessionData?.isLive ? "🟢 Live" : "⚫ Offline",
                      icon: Eye,
                      color: sessionData?.isLive ? "text-emerald-400" : "text-[#565b6e]",
                    },
                  ].map(stat => (
                    <div key={stat.label} className="bg-[#0f1117] rounded-xl p-3.5 border border-[#1e2028] text-center">
                      <stat.icon className={`w-4 h-4 mx-auto mb-1.5 ${stat.color}`} />
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                      <p className="text-[10px] text-[#565b6e] mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Last active / live info */}
                <div className="flex items-center gap-2 bg-[#0f1117] rounded-lg px-4 py-2.5 border border-[#1e2028] mb-6">
                  {sessionData?.isLive ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="text-xs text-emerald-400 font-medium">Currently browsing</span>
                      {sessionData.currentPage && (
                        <span className="text-[10px] text-[#8b8fa3] font-mono bg-[#1a1c25] px-2 py-0.5 rounded">{sessionData.currentPage}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-[#565b6e]" />
                      <span className="text-xs text-[#8b8fa3]">Last active:</span>
                      {videoStats?.lastWatched ? (
                        <>
                          <span className="text-xs text-[#c4c7d4] font-medium">
                            {format(new Date(videoStats.lastWatched), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                          <span className="text-[10px] text-[#565b6e]">
                            ({formatDistanceToNow(new Date(videoStats.lastWatched), { addSuffix: true })})
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-[#565b6e]">No activity recorded</span>
                      )}
                    </>
                  )}
                  {sessionData?.totalSessions ? (
                    <span className="ml-auto text-[10px] text-[#565b6e]">{sessionData.totalSessions} total sessions</span>
                  ) : null}
                </div>

                {/* Two-column grid of sections */}
                <div className="grid grid-cols-2 gap-5">
                  {/* Watch History */}
                  <div className="bg-[#0f1117] rounded-xl border border-[#1e2028] p-4">
                    <SectionHeader icon={Play} label="Watch History" count={videoStats?.totalWatched || 0} color="text-violet-400" />
                    {videoStats?.recentVideos?.length ? (
                      <div className="space-y-0 divide-y divide-[#1e2028]/60 max-h-[260px] overflow-y-auto pr-1">
                        {videoStats.recentVideos.map((item: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-2.5 py-2 group cursor-pointer hover:bg-[#1a1c25]/50 -mx-1 px-1 rounded"
                            onClick={() => {
                              if (item.video?.video_id) {
                                onOpenChange(false);
                                navigate(`/video/${item.video.video_id}`);
                              }
                            }}
                          >
                            {item.video?.thumbnail && (
                              <img src={item.video.thumbnail} alt="" className="w-16 h-9 rounded object-cover shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-[#c4c7d4] truncate">{item.video?.title || "Unknown"}</p>
                              <p className="text-[10px] text-[#565b6e]">{item.video?.channel_name}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] text-[#4a4e5e]">
                                {formatDistanceToNow(new Date(item.watched_at), { addSuffix: true })}
                              </span>
                              <ExternalLink className="w-3 h-3 text-[#4a4e5e] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#565b6e] text-center py-6">No watch history</p>
                    )}
                  </div>

                  {/* Subscriptions */}
                  <div className="bg-[#0f1117] rounded-xl border border-[#1e2028] p-4">
                    <SectionHeader icon={Tv} label="Subscriptions" count={subscriptions?.length || 0} color="text-blue-400" />
                    {subscriptions?.length ? (
                      <div className="space-y-0 divide-y divide-[#1e2028]/60 max-h-[260px] overflow-y-auto pr-1">
                        {subscriptions.map((sub: any) => (
                          <div key={sub.id} className="flex items-center gap-2.5 py-2">
                            {sub.channel?.thumbnail_url && (
                              <img src={sub.channel.thumbnail_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                            )}
                            <p className="text-xs text-[#c4c7d4] truncate flex-1">{sub.channel?.title || sub.channel_id}</p>
                            <span className="text-[10px] text-[#4a4e5e] shrink-0">
                              {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#565b6e] text-center py-6">No subscriptions</p>
                    )}
                  </div>

                  {/* Comments */}
                  <div className="bg-[#0f1117] rounded-xl border border-[#1e2028] p-4">
                    <SectionHeader icon={MessageSquare} label="Comments" count={comments?.length || 0} color="text-emerald-400" />
                    {comments?.length ? (
                      <div className="space-y-0 divide-y divide-[#1e2028]/60 max-h-[260px] overflow-y-auto pr-1">
                        {comments.map((c: any) => (
                          <div key={c.id} className="py-2">
                            <p className="text-xs text-[#c4c7d4] line-clamp-2">{c.content}</p>
                            <p className="text-[10px] text-[#4a4e5e] mt-1">
                              {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#565b6e] text-center py-6">No comments</p>
                    )}
                  </div>

                  {/* Channel Requests */}
                  <div className="bg-[#0f1117] rounded-xl border border-[#1e2028] p-4">
                    <SectionHeader icon={GitPullRequest} label="Channel Requests" count={channelRequests?.length || 0} color="text-sky-400" />
                    {channelRequests?.length ? (
                      <div className="space-y-0 divide-y divide-[#1e2028]/60 max-h-[260px] overflow-y-auto pr-1">
                        {channelRequests.map((r: any) => (
                          <div key={r.id} className="flex items-center gap-2.5 py-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-[#c4c7d4] truncate">{r.channel_name}</p>
                              <p className="text-[10px] text-[#4a4e5e]">
                                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            <Badge className={`text-[10px] ${statusColor(r.status)}`}>
                              {r.status || "pending"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#565b6e] text-center py-6">No channel requests</p>
                    )}
                  </div>

                  {/* Contact Requests - full width */}
                  <div className="bg-[#0f1117] rounded-xl border border-[#1e2028] p-4 col-span-2">
                    <SectionHeader icon={Mail} label="Contact Requests" count={contactRequests?.length || 0} color="text-amber-400" />
                    {contactRequests?.length ? (
                      <div className="grid grid-cols-2 gap-3">
                        {contactRequests.map((r: any) => (
                          <div key={r.id} className="bg-[#13141b] rounded-lg p-3 border border-[#1e2028]/50">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge className={`text-[10px] ${statusColor(r.status)}`}>{r.status}</Badge>
                              <span className="text-[10px] text-[#4a4e5e]">
                                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-xs text-[#c4c7d4] line-clamp-2">{r.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#565b6e] text-center py-6">No contact requests</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
