import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Flag, ExternalLink, Search, X, Trash2, AlertTriangle,
  Mail, Calendar, MessageSquare, User, Hash, Copy, Eye,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface VideoReport {
  id: string;
  message: string;
  email: string;
  created_at: string;
  video_id: string;
  user_id: string | null;
  youtube_videos: {
    title: string;
    video_id: string;
    thumbnail: string;
    channel_name: string;
  } | null;
  profiles: {
    display_name: string | null;
    username: string | null;
    email: string;
  } | null;
}

interface GroupedReport {
  videoDbId: string;
  videoTitle: string;
  videoSlug: string;
  thumbnail: string;
  channelName: string;
  reportCount: number;
  latestReport: string;
  reports: VideoReport[];
}

export const ReportedVideosPageV2 = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["video-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_reports")
        .select(`*, youtube_videos (title, video_id, thumbnail, channel_name)`)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch profile info for reports with user_id
      const userIds = [...new Set((data || []).map(r => r.user_id).filter(Boolean))] as string[];
      let profilesMap: Record<string, { display_name: string | null; username: string | null; email: string }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, username, email")
          .in("id", userIds);
        if (profiles) {
          for (const p of profiles) {
            profilesMap[p.id] = { display_name: p.display_name, username: p.username, email: p.email };
          }
        }
      }

      return (data || []).map(r => ({
        ...r,
        profiles: r.user_id ? profilesMap[r.user_id] || null : null,
      })) as VideoReport[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("reports-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "video_reports" }, () => {
        queryClient.invalidateQueries({ queryKey: ["video-reports"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (videoDbId: string) => {
      const { data, error } = await supabase.rpc("admin_delete_video", {
        video_id_param: videoDbId,
        admin_user_id: user?.id,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Video deleted from site");
      setSelectedVideoId(null);
      queryClient.invalidateQueries({ queryKey: ["video-reports"] });
      queryClient.invalidateQueries({ queryKey: ["moderation"] });
    },
    onError: (e: any) => toast.error(e?.message || "Failed to delete video"),
  });

  // Group reports by video
  const grouped = useMemo(() => {
    if (!reports) return [];
    const map: Record<string, GroupedReport> = {};
    for (const r of reports) {
      const key = r.video_id;
      if (!map[key]) {
        map[key] = {
          videoDbId: key,
          videoTitle: r.youtube_videos?.title || "Unknown Video",
          videoSlug: r.youtube_videos?.video_id || "",
          thumbnail: r.youtube_videos?.thumbnail || "",
          channelName: r.youtube_videos?.channel_name || "Unknown Channel",
          reportCount: 0,
          latestReport: r.created_at,
          reports: [],
        };
      }
      map[key].reportCount++;
      map[key].reports.push(r);
      if (r.created_at > map[key].latestReport) map[key].latestReport = r.created_at;
    }
    return Object.values(map).sort((a, b) => b.reportCount - a.reportCount);
  }, [reports]);

  const filtered = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.toLowerCase();
    return grouped.filter(g =>
      g.videoTitle.toLowerCase().includes(q) ||
      g.channelName.toLowerCase().includes(q) ||
      g.reports.some(r => r.email.toLowerCase().includes(q))
    );
  }, [grouped, search]);

  const selected = grouped.find(g => g.videoDbId === selectedVideoId) || null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const severityBadge = (count: number) => {
    if (count >= 3) {
      return (
        <Badge className="bg-red-500/15 text-red-400 border-red-500/20 hover:bg-red-500/20">
          <AlertTriangle className="w-3 h-3 mr-1" />{count} reports
        </Badge>
      );
    }
    if (count >= 2) {
      return (
        <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/20">
          {count} reports
        </Badge>
      );
    }
    return (
      <Badge className="bg-[#1e2028] text-[#8b8fa3] border-[#2a2d3a] hover:bg-[#1e2028]">
        {count} report
      </Badge>
    );
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-132px)]">
      {/* Left: list */}
      <div className="flex flex-col min-w-0 flex-1">
        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#13141b] border border-[#1e2028]">
            <Flag className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-medium text-[#c4c7d4]">{reports?.length || 0} total reports</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#13141b] border border-[#1e2028]">
            <Eye className="w-3.5 h-3.5 text-[#818cf8]" />
            <span className="text-xs font-medium text-[#c4c7d4]">{grouped.length} videos reported</span>
          </div>
          {grouped.filter(g => g.reportCount >= 3).length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-medium text-red-400">
                {grouped.filter(g => g.reportCount >= 3).length} high priority
              </span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565b6e]" />
          <Input
            placeholder="Search videos, channels or reporters..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-[#13141b] border-[#1e2028] text-white placeholder:text-[#4a4e5e] h-9 text-sm"
          />
        </div>

        {/* List */}
        <div className="rounded-xl border border-[#1e2028] bg-[#0f1117] overflow-hidden flex-1 min-h-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-[#1a1c25] rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#565b6e]">
              <Flag className="w-8 h-8 mb-3 opacity-40" />
              <p className="text-sm">No reported videos found</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-2 divide-y divide-[#1e2028]">
                {filtered.map(group => {
                  const isActive = selectedVideoId === group.videoDbId;
                  return (
                    <button
                      key={group.videoDbId}
                      onClick={() => setSelectedVideoId(isActive ? null : group.videoDbId)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-all ${
                        isActive
                          ? "bg-[#6366f1]/10 border border-[#6366f1]/20"
                          : "hover:bg-[#1a1c25] border border-transparent"
                      }`}
                    >
                      {group.thumbnail && (
                        <img
                          src={group.thumbnail}
                          alt=""
                          className="w-16 h-10 rounded object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#c4c7d4] truncate">{group.videoTitle}</p>
                        <p className="text-xs text-[#565b6e] mt-0.5 truncate">
                          {group.channelName}
                          {" · "}
                          {formatDistanceToNow(new Date(group.latestReport), { addSuffix: true })}
                        </p>
                      </div>
                      {severityBadge(group.reportCount)}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Right: detail panel */}
      <div className="w-[420px] shrink-0 rounded-xl border border-[#1e2028] bg-[#0f1117] flex flex-col overflow-hidden">
        {selected ? (
          <>
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2028] shrink-0">
              <h3 className="text-sm font-semibold text-white truncate pr-3">Report Details</h3>
              <button
                onClick={() => setSelectedVideoId(null)}
                className="p-1 rounded hover:bg-white/5 text-[#565b6e] hover:text-[#8b8fa3] transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-5 space-y-6">
                {/* Video info */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#565b6e] font-semibold mb-3">Video</p>
                  {selected.thumbnail && (
                    <img
                      src={selected.thumbnail}
                      alt=""
                      className="w-full h-40 rounded-lg object-cover mb-3"
                    />
                  )}
                  <div className="space-y-2.5">
                    <div className="bg-[#13141b] rounded-lg p-3.5 border border-[#1e2028]">
                      <p className="text-[10px] text-[#565b6e] mb-1">Title</p>
                      <p className="text-sm font-medium text-[#c4c7d4]">{selected.videoTitle}</p>
                    </div>
                    <div className="bg-[#13141b] rounded-lg p-3.5 border border-[#1e2028]">
                      <p className="text-[10px] text-[#565b6e] mb-1">Channel</p>
                      <p className="text-sm text-[#c4c7d4]">{selected.channelName}</p>
                    </div>
                    <div className="bg-[#13141b] rounded-lg p-3.5 border border-[#1e2028] flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-[#565b6e] mb-1">Report Count</p>
                        {severityBadge(selected.reportCount)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#818cf8] hover:text-[#a5b4fc] hover:bg-[#818cf8]/10 text-xs"
                        onClick={() => window.open(`/video/${selected.videoSlug}`, "_blank")}
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        View Video
                      </Button>
                    </div>
                  </div>
                </div>

                {/* All reporters */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#565b6e] font-semibold mb-3">
                    Reporters ({selected.reportCount})
                  </p>
                  <div className="space-y-3">
                    {selected.reports.map((report, idx) => {
                      const name = report.profiles?.display_name || report.profiles?.username || null;
                      return (
                        <div
                          key={report.id}
                          className="bg-[#13141b] rounded-lg border border-[#1e2028] overflow-hidden"
                        >
                          {/* Reporter header */}
                          <div className="px-3.5 py-2.5 border-b border-[#1e2028]/50 flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-full bg-[#6366f1]/15 flex items-center justify-center shrink-0">
                                <User className="w-3 h-3 text-[#818cf8]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-[#c4c7d4] truncate">
                                  {name || "Anonymous User"}
                                </p>
                              </div>
                            </div>
                            <span className="text-[9px] text-[#4a4e5e] shrink-0 ml-2">
                              #{idx + 1}
                            </span>
                          </div>

                          {/* Reporter details */}
                          <div className="px-3.5 py-2.5 space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-[#565b6e] shrink-0" />
                              <p className="text-xs text-[#8b8fa3] truncate flex-1">{report.email}</p>
                              <button
                                onClick={() => copyToClipboard(report.email, "Email")}
                                className="text-[#565b6e] hover:text-[#818cf8] transition-colors shrink-0"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            {report.user_id && (
                              <div className="flex items-center gap-2">
                                <Hash className="w-3 h-3 text-[#565b6e] shrink-0" />
                                <p className="text-[10px] text-[#6b7084] font-mono truncate flex-1">{report.user_id}</p>
                                <button
                                  onClick={() => copyToClipboard(report.user_id!, "User ID")}
                                  className="text-[#565b6e] hover:text-[#818cf8] transition-colors shrink-0"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-[#565b6e] shrink-0" />
                              <p className="text-xs text-[#6b7084]">
                                {format(new Date(report.created_at), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                            </div>

                            {/* Report message */}
                            <div className="mt-1.5 bg-[#0d0e14] rounded-md p-2.5 border border-[#1a1c25]">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-3 h-3 text-[#565b6e] mt-0.5 shrink-0" />
                                <p className="text-xs text-[#8b8fa3] leading-relaxed">{report.message}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#565b6e] font-semibold mb-3">Actions</p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 h-9 text-xs text-[#818cf8] hover:text-[#a5b4fc] hover:bg-[#818cf8]/10 border border-[#6366f1]/20"
                      onClick={() => window.open(`/video/${selected.videoSlug}`, "_blank")}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      View Video
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 h-9 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          {deleteMutation.isPending ? "Deleting..." : "Delete Video"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#13141b] border-[#1e2028] text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Delete this video?</AlertDialogTitle>
                          <AlertDialogDescription className="text-[#8b8fa3]">
                            This will remove "{selected.videoTitle}" from the entire site. The video can be restored from the Deleted Items section.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-[#1a1c25] border-[#2a2d3a] text-[#c4c7d4] hover:bg-[#22242e] hover:text-white">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(selected.videoDbId)}
                            className="bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25"
                          >
                            Delete Video
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#565b6e] px-6">
            <div className="w-12 h-12 rounded-xl bg-[#1a1c25] flex items-center justify-center mb-4">
              <Flag className="w-5 h-5 opacity-50" />
            </div>
            <p className="text-sm font-medium text-[#8b8fa3] mb-1">No video selected</p>
            <p className="text-xs text-center">Select a reported video from the list to view all reports and take action</p>
          </div>
        )}
      </div>
    </div>
  );
};
