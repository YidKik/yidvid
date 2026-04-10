import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GitPullRequest, Mail, MessageSquare, Play, Heart, Tv, Clock,
  ChevronRight, ExternalLink, Calendar, Eye
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface UserActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onNavigate?: (tab: string) => void;
}

export const UserActivityDialog = ({ open, onOpenChange, userId, userName, onNavigate }: UserActivityDialogProps) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Fetch all user activity data in parallel
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

      // Fetch channel names
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
      // Get total count and last watched
      const { count } = await supabase
        .from("video_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { data: recent } = await supabase
        .from("video_history")
        .select("video_id, watched_at")
        .eq("user_id", userId)
        .order("watched_at", { ascending: false })
        .limit(10);

      let recentVideos: any[] = [];
      if (recent?.length) {
        const videoIds = recent.map(r => r.video_id);
        const { data: videos } = await supabase
          .from("youtube_videos")
          .select("id, title, channel_name, thumbnail, video_id")
          .in("id", videoIds);

        const videoMap = new Map(videos?.map(v => [v.id, v]) || []);
        recentVideos = recent.map(r => ({
          ...r,
          video: videoMap.get(r.video_id),
        }));
      }

      // Get unique channels viewed
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

  const isLoading = loadingCR || loadingContact || loadingComments || loadingSubs || loadingVideos || loadingFavs;

  const sections = [
    {
      id: "watch",
      icon: Play,
      label: "Watch Activity",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      count: videoStats?.totalWatched || 0,
      summary: videoStats?.lastWatched
        ? `Last watched ${formatDistanceToNow(new Date(videoStats.lastWatched), { addSuffix: true })}`
        : "No watch history",
    },
    {
      id: "subscriptions",
      icon: Tv,
      label: "Channel Subscriptions",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      count: subscriptions?.length || 0,
      summary: `${subscriptions?.length || 0} channels subscribed`,
    },
    {
      id: "favorites",
      icon: Heart,
      label: "Favorites",
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      count: favorites || 0,
      summary: `${favorites || 0} videos favorited`,
    },
    {
      id: "comments",
      icon: MessageSquare,
      label: "Comments",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      count: comments?.length || 0,
      summary: `${comments?.length || 0} comments posted`,
    },
    {
      id: "channel_requests",
      icon: GitPullRequest,
      label: "Channel Requests",
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      count: channelRequests?.length || 0,
      summary: `${channelRequests?.length || 0} requests submitted`,
    },
    {
      id: "contact_requests",
      icon: Mail,
      label: "Contact Requests",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      count: contactRequests?.length || 0,
      summary: `${contactRequests?.length || 0} messages sent`,
    },
  ];

  const toggleSection = (id: string) => {
    setActiveSection(activeSection === id ? null : id);
  };

  const statusColor = (status: string | null) => {
    switch (status) {
      case "approved": case "resolved": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
      case "rejected": return "bg-red-500/15 text-red-400 border-red-500/20";
      case "pending": return "bg-amber-500/15 text-amber-400 border-amber-500/20";
      default: return "bg-slate-500/15 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#13141b] border-[#2a2d3a] text-gray-200 max-w-[600px] max-h-[80vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-[#1e2028] shrink-0">
          <DialogTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#818cf8]" />
            User Activity — {userName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(80vh-80px)]">
          <div className="p-5 space-y-5">
            {/* Overview stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0f1117] rounded-lg p-3 border border-[#1e2028] text-center">
                <p className="text-xl font-bold text-white">{isLoading ? "—" : videoStats?.totalWatched || 0}</p>
                <p className="text-[10px] text-[#565b6e] mt-0.5">Videos Watched</p>
              </div>
              <div className="bg-[#0f1117] rounded-lg p-3 border border-[#1e2028] text-center">
                <p className="text-xl font-bold text-white">{isLoading ? "—" : videoStats?.uniqueChannels || 0}</p>
                <p className="text-[10px] text-[#565b6e] mt-0.5">Channels Explored</p>
              </div>
              <div className="bg-[#0f1117] rounded-lg p-3 border border-[#1e2028] text-center">
                <p className="text-xl font-bold text-white">{isLoading ? "—" : subscriptions?.length || 0}</p>
                <p className="text-[10px] text-[#565b6e] mt-0.5">Subscriptions</p>
              </div>
            </div>

            {/* Last active */}
            {videoStats?.lastWatched && (
              <div className="flex items-center gap-2 bg-[#0f1117] rounded-lg px-4 py-2.5 border border-[#1e2028]">
                <Clock className="w-3.5 h-3.5 text-[#565b6e]" />
                <span className="text-xs text-[#8b8fa3]">Last active:</span>
                <span className="text-xs text-[#c4c7d4] font-medium">
                  {format(new Date(videoStats.lastWatched), "MMM d, yyyy 'at' h:mm a")}
                </span>
                <span className="text-[10px] text-[#565b6e]">
                  ({formatDistanceToNow(new Date(videoStats.lastWatched), { addSuffix: true })})
                </span>
              </div>
            )}

            {/* Expandable sections */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full bg-[#1a1c25] rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {sections.map(section => {
                  const Icon = section.icon;
                  const isExpanded = activeSection === section.id;

                  return (
                    <div key={section.id} className="rounded-xl border border-[#1e2028] overflow-hidden">
                      {/* Section header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isExpanded ? "bg-[#1a1c25]" : "bg-[#0f1117] hover:bg-[#14151d]"
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${section.bg} shrink-0`}>
                          <Icon className={`w-3.5 h-3.5 ${section.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#c4c7d4]">{section.label}</p>
                          <p className="text-[10px] text-[#565b6e]">{section.summary}</p>
                        </div>
                        <span className="text-[11px] font-bold text-[#565b6e] bg-[#1a1c25] rounded-full px-2 py-0.5">
                          {section.count}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-[#4a4e5e] transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="border-t border-[#1e2028] bg-[#0c0d13]">
                          {/* Watch Activity */}
                          {section.id === "watch" && (
                            videoStats?.recentVideos?.length ? (
                              <div className="divide-y divide-[#1e2028]/60">
                                {videoStats.recentVideos.map((item: any, i: number) => (
                                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                                    {item.video?.thumbnail && (
                                      <img src={item.video.thumbnail} alt="" className="w-14 h-8 rounded object-cover shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-[#c4c7d4] truncate">{item.video?.title || "Unknown"}</p>
                                      <p className="text-[10px] text-[#565b6e]">{item.video?.channel_name}</p>
                                    </div>
                                    <span className="text-[10px] text-[#4a4e5e] shrink-0">
                                      {formatDistanceToNow(new Date(item.watched_at), { addSuffix: true })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#565b6e] px-4 py-4 text-center">No watch history</p>
                            )
                          )}

                          {/* Subscriptions */}
                          {section.id === "subscriptions" && (
                            subscriptions?.length ? (
                              <div className="divide-y divide-[#1e2028]/60">
                                {subscriptions.slice(0, 20).map((sub: any) => (
                                  <div key={sub.id} className="flex items-center gap-3 px-4 py-2.5">
                                    {sub.channel?.thumbnail_url && (
                                      <img src={sub.channel.thumbnail_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-[#c4c7d4] truncate">{sub.channel?.title || sub.channel_id}</p>
                                    </div>
                                    <span className="text-[10px] text-[#4a4e5e] shrink-0">
                                      {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#565b6e] px-4 py-4 text-center">No subscriptions</p>
                            )
                          )}

                          {/* Favorites */}
                          {section.id === "favorites" && (
                            <p className="text-xs text-[#565b6e] px-4 py-4 text-center">
                              {favorites ? `${favorites} videos favorited` : "No favorites"}
                            </p>
                          )}

                          {/* Comments */}
                          {section.id === "comments" && (
                            comments?.length ? (
                              <div className="divide-y divide-[#1e2028]/60">
                                {comments.slice(0, 15).map((c: any) => (
                                  <div key={c.id} className="px-4 py-2.5">
                                    <p className="text-xs text-[#c4c7d4] line-clamp-2">{c.content}</p>
                                    <p className="text-[10px] text-[#4a4e5e] mt-1">
                                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#565b6e] px-4 py-4 text-center">No comments</p>
                            )
                          )}

                          {/* Channel Requests */}
                          {section.id === "channel_requests" && (
                            channelRequests?.length ? (
                              <div className="divide-y divide-[#1e2028]/60">
                                {channelRequests.map((r: any) => (
                                  <div key={r.id} className="flex items-center gap-3 px-4 py-2.5">
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
                              <p className="text-xs text-[#565b6e] px-4 py-4 text-center">No channel requests</p>
                            )
                          )}

                          {/* Contact Requests */}
                          {section.id === "contact_requests" && (
                            contactRequests?.length ? (
                              <div className="divide-y divide-[#1e2028]/60">
                                {contactRequests.map((r: any) => (
                                  <div key={r.id} className="px-4 py-2.5">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge className={`text-[10px] ${statusColor(r.status)}`}>
                                        {r.status}
                                      </Badge>
                                      <span className="text-[10px] text-[#4a4e5e]">
                                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                                      </span>
                                    </div>
                                    <p className="text-xs text-[#c4c7d4] line-clamp-2">{r.message}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#565b6e] px-4 py-4 text-center">No contact requests</p>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
