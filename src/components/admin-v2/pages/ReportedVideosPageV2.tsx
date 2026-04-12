import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Flag, ExternalLink, ChevronDown, ChevronRight, Loader2, AlertTriangle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VideoReport {
  id: string;
  message: string;
  email: string;
  created_at: string;
  video_id: string;
  youtube_videos: {
    title: string;
    video_id: string;
    thumbnail: string;
    channel_name: string;
  } | null;
}

interface GroupedReport {
  videoId: string;
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
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["video-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_reports")
        .select(`*, youtube_videos (title, video_id, thumbnail, channel_name)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as VideoReport[];
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

  // Group reports by video
  const grouped = useMemo(() => {
    if (!reports) return [];
    const map: Record<string, GroupedReport> = {};
    for (const r of reports) {
      const key = r.video_id;
      if (!map[key]) {
        map[key] = {
          videoId: key,
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

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#13141b] border border-[#1e2028] rounded-xl p-5">
          <p className="text-[11px] uppercase tracking-wider text-[#565b6e] font-semibold mb-1">Total Reports</p>
          <p className="text-2xl font-bold text-white">{reports?.length || 0}</p>
        </div>
        <div className="bg-[#13141b] border border-[#1e2028] rounded-xl p-5">
          <p className="text-[11px] uppercase tracking-wider text-[#565b6e] font-semibold mb-1">Reported Videos</p>
          <p className="text-2xl font-bold text-white">{grouped.length}</p>
        </div>
        <div className="bg-[#13141b] border border-[#1e2028] rounded-xl p-5">
          <p className="text-[11px] uppercase tracking-wider text-[#565b6e] font-semibold mb-1">Most Reported</p>
          <p className="text-sm font-medium text-white truncate">
            {grouped[0]?.videoTitle || "—"}{grouped[0] ? ` (${grouped[0].reportCount})` : ""}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565b6e]" />
        <Input
          placeholder="Search videos, channels or reporters..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-[#13141b] border-[#1e2028] text-white placeholder:text-[#4a4e5e]"
        />
      </div>

      {/* Main table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#565b6e]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#565b6e]">
          <Flag className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-sm font-medium">No reported videos</p>
        </div>
      ) : (
        <div className="bg-[#13141b] border border-[#1e2028] rounded-xl overflow-hidden">
          <ScrollArea className="max-h-[calc(100vh-340px)]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#1e2028] hover:bg-transparent">
                  <TableHead className="text-[#8b8fa3] w-10"></TableHead>
                  <TableHead className="text-[#8b8fa3]">Video</TableHead>
                  <TableHead className="text-[#8b8fa3]">Channel</TableHead>
                  <TableHead className="text-[#8b8fa3] text-center">Reports</TableHead>
                  <TableHead className="text-[#8b8fa3]">Latest Report</TableHead>
                  <TableHead className="text-[#8b8fa3] w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(group => (
                  <>
                    <TableRow
                      key={group.videoId}
                      className="border-[#1e2028] hover:bg-[#1a1c25] cursor-pointer"
                      onClick={() => setExpandedVideo(expandedVideo === group.videoId ? null : group.videoId)}
                    >
                      <TableCell className="text-center">
                        {expandedVideo === group.videoId
                          ? <ChevronDown className="w-4 h-4 text-[#8b8fa3] inline" />
                          : <ChevronRight className="w-4 h-4 text-[#8b8fa3] inline" />}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {group.thumbnail && (
                            <img src={group.thumbnail} alt="" className="w-12 h-8 rounded object-cover shrink-0" />
                          )}
                          <span className="text-sm text-white font-medium line-clamp-1">{group.videoTitle}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#8b8fa3] text-sm">{group.channelName}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          group.reportCount >= 3
                            ? "bg-red-500/15 text-red-400 border border-red-500/20"
                            : group.reportCount >= 2
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                            : "bg-[#1e2028] text-[#8b8fa3]"
                        }`}>
                          {group.reportCount >= 3 && <AlertTriangle className="w-3 h-3" />}
                          {group.reportCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-[#8b8fa3] text-sm">
                        {formatDistanceToNow(new Date(group.latestReport), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#8b8fa3] hover:text-white hover:bg-[#1e2028]"
                          onClick={e => {
                            e.stopPropagation();
                            window.open(`/video/${group.videoSlug}`, "_blank");
                          }}
                          title="Open video"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded reports */}
                    {expandedVideo === group.videoId && group.reports.map(report => (
                      <TableRow key={report.id} className="border-[#1e2028]/50 bg-[#0d0e14]">
                        <TableCell />
                        <TableCell colSpan={2}>
                          <div className="pl-4 border-l-2 border-[#2a2d3a]">
                            <p className="text-xs text-[#8b8fa3]">
                              <span className="text-[#c4c7d4] font-medium">{report.email}</span>
                            </p>
                            <p className="text-xs text-[#6b7084] mt-1 line-clamp-2">{report.message}</p>
                          </div>
                        </TableCell>
                        <TableCell />
                        <TableCell className="text-[#565b6e] text-xs">
                          {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
