import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Search, Plus, Video, Trash2, RotateCcw, RefreshCw, Loader2, Tv,
  ChevronRight, ExternalLink, Hash, Calendar, Eye, AlertCircle, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddChannelForm } from "@/components/AddChannelForm";
import { AddVideoForm } from "@/components/youtube/AddVideoForm";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";

// ─── dark card helper ───────────────────────────────────────────────
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-[#1e2028] bg-[#12131a] ${className}`}>{children}</div>
);

// ─── Main page ──────────────────────────────────────────────────────
export const ChannelsPageV2 = () => {
  const { user } = useUnifiedAuth();
  const { session } = useSessionManager();
  const { totalStats: analyticsStats } = useAnalyticsData(session?.user?.id);
  const [search, setSearch] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [addChannelOpen, setAddChannelOpen] = useState(false);
  const [addVideoOpen, setAddVideoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"channels" | "deleted">("channels");
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch channels ────────────────────────────────────────────────
  const { data: channels = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-channels-v2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // ── Fetch video counts per channel ────────────────────────────────
  const { data: videoCounts = {} } = useQuery({
    queryKey: ["admin-channel-video-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("channel_id")
        .is("deleted_at", null);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((v) => {
        counts[v.channel_id] = (counts[v.channel_id] || 0) + 1;
      });
      return counts;
    },
  });

  // ── Deleted items ─────────────────────────────────────────────────
  const { data: deletedChannels = [], refetch: refetchDeleted } = useQuery({
    queryKey: ["admin-deleted-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: deletedVideos = [], refetch: refetchDeletedVideos } = useQuery({
    queryKey: ["admin-deleted-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  // ── Actions ───────────────────────────────────────────────────────
  const handleDeleteChannel = async (channelId: string) => {
    if (!user?.id) return;
    try {
      setIsDeleting(true);
      const { data, error } = await supabase.rpc("admin_delete_channel", {
        channel_id_param: channelId,
        admin_user_id: user.id,
      });
      if (error) throw new Error(error.message);
      const res = data as { success: boolean; error?: string };
      if (!res?.success) throw new Error(res?.error || "Failed");
      toast.success("Channel deleted");
      if (selectedChannelId === channelId) setSelectedChannelId(null);
      refetch();
      refetchDeleted();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (type: "channel" | "video", id: string) => {
    if (!user?.id) return;
    try {
      if (type === "channel") {
        const { data, error } = await supabase.rpc("admin_restore_channel" as any, {
          channel_id_param: id,
          admin_user_id: user.id,
        });
        if (error) throw error;
        const res = data as { success: boolean; error?: string };
        if (!res?.success) throw new Error(res?.error || "Failed");
        toast.success("Channel restored");
        refetch();
        refetchDeleted();
        refetchDeletedVideos();
      } else {
        const { data, error } = await supabase.rpc("admin_restore_video" as any, {
          video_id_param: id,
          admin_user_id: user.id,
        });
        if (error) throw error;
        const res = data as { success: boolean; error?: string };
        if (!res?.success) throw new Error(res?.error || "Failed");
        toast.success("Video restored");
        refetchDeletedVideos();
      }
    } catch (e: any) {
      toast.error(e.message || "Restore failed");
    }
  };

  // ── Filter ────────────────────────────────────────────────────────
  const filtered = channels.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.channel_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Analytics summary */}
      {analyticsStats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#1e2028] bg-[#12131a] p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Channels</p>
                <p className="text-2xl font-bold text-white">{analyticsStats.totalChannels}</p>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-600">
                <Tv className="w-4.5 h-4.5 text-white" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[#1e2028] bg-[#12131a] p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Videos</p>
                <p className="text-2xl font-bold text-white">{analyticsStats.totalVideos}</p>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-sky-600">
                <Video className="w-4.5 h-4.5 text-white" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[#1e2028] bg-[#12131a] p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Watch Time</p>
                <p className="text-2xl font-bold text-white">{analyticsStats.totalHours}h</p>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-600">
                <Clock className="w-4.5 h-4.5 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("channels")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "channels"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-[#1e2028]"
            }`}
          >
            Channels ({channels.length})
          </button>
          <button
            onClick={() => setActiveTab("deleted")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "deleted"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-[#1e2028]"
            }`}
          >
            Deleted ({deletedChannels.length + deletedVideos.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddVideoOpen(true)}
            className="border-[#2a2b35] bg-transparent text-gray-300 hover:bg-[#1e2028] hover:text-white gap-1.5"
          >
            <Video className="w-4 h-4" /> Add Video
          </Button>
          <Button
            size="sm"
            onClick={() => setAddChannelOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Channel
          </Button>
        </div>
      </div>

      {activeTab === "channels" ? (
        <div className="flex gap-5 h-[calc(100vh-13rem)]">
          {/* Left: Channel list */}
          <Card className="w-[420px] flex flex-col shrink-0">
            <div className="p-3 border-b border-[#1e2028]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search channels..."
                  className="pl-9 bg-[#0a0b10] border-[#1e2028] text-white placeholder:text-gray-500 h-9"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">No channels found</div>
              ) : (
                filtered.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannelId(channel.channel_id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-[#1e2028]/50 ${
                      selectedChannelId === channel.channel_id
                        ? "bg-indigo-600/10 border-l-2 border-l-indigo-500"
                        : "hover:bg-[#1a1b24] border-l-2 border-l-transparent"
                    }`}
                  >
                    {channel.thumbnail_url ? (
                      <img
                        src={channel.thumbnail_url}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#1e2028] flex items-center justify-center shrink-0">
                        <Tv className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{channel.title}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          {videoCounts[channel.channel_id] || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {channel.last_fetch
                            ? format(new Date(channel.last_fetch), "MMM d")
                            : "Never"}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                  </button>
                ))
              )}
            </ScrollArea>
          </Card>

          {/* Right: Channel details / videos */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            {selectedChannelId ? (
              <ChannelDetailPanel
                channelId={selectedChannelId}
                channels={channels}
                videoCounts={videoCounts}
                onDelete={handleDeleteChannel}
                isDeleting={isDeleting}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center space-y-2">
                  <Tv className="w-10 h-10 mx-auto text-gray-600" />
                  <p className="text-sm">Select a channel to view details & videos</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* Deleted items tab */
        <DeletedItemsPanel
          deletedChannels={deletedChannels}
          deletedVideos={deletedVideos}
          onRestore={handleRestore}
        />
      )}

      {/* Dialogs */}
      <Dialog open={addChannelOpen} onOpenChange={setAddChannelOpen}>
        <DialogContent className="bg-[#12131a] border-[#1e2028] text-white">
          <DialogHeader>
            <DialogTitle>Add YouTube Channel</DialogTitle>
          </DialogHeader>
          <AddChannelForm
            onClose={() => setAddChannelOpen(false)}
            onSuccess={() => {
              setAddChannelOpen(false);
              refetch();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={addVideoOpen} onOpenChange={setAddVideoOpen}>
        <DialogContent className="bg-[#12131a] border-[#1e2028] text-white">
          <DialogHeader>
            <DialogTitle>Add Single Video</DialogTitle>
          </DialogHeader>
          <AddVideoForm
            onClose={() => setAddVideoOpen(false)}
            onSuccess={() => {
              setAddVideoOpen(false);
              refetch();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Channel Detail Panel ───────────────────────────────────────────
const ChannelDetailPanel = ({
  channelId,
  channels,
  videoCounts,
  onDelete,
  isDeleting,
}: {
  channelId: string;
  channels: any[];
  videoCounts: Record<string, number>;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) => {
  const channel = channels.find((c) => c.channel_id === channelId);
  const { user } = useUnifiedAuth();

  // Fetch videos for this channel
  const { data: videos = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-channel-videos", channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("channel_id", channelId)
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const handleDeleteVideo = async (videoId: string) => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase.rpc("admin_delete_video", {
        video_id_param: videoId,
        admin_user_id: user.id,
      });
      if (error) throw error;
      const res = data as { success: boolean; error?: string };
      if (!res?.success) throw new Error(res?.error || "Failed");
      toast.success("Video deleted");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  if (!channel) return null;

  return (
    <>
      {/* Channel info header */}
      <div className="p-5 border-b border-[#1e2028] flex items-center gap-4">
        {channel.thumbnail_url ? (
          <img src={channel.thumbnail_url} alt="" className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#1e2028] flex items-center justify-center">
            <Tv className="w-5 h-5 text-gray-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">{channel.title}</h3>
          <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" /> {channel.channel_id}
            </span>
            <span className="flex items-center gap-1">
              <Video className="w-3 h-3" /> {videoCounts[channelId] || 0} videos
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Last fetch: {channel.last_fetch ? format(new Date(channel.last_fetch), "MMM d, yyyy h:mm a") : "Never"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-[#2a2b35] bg-transparent text-gray-400 hover:text-white hover:bg-[#1e2028]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <a
            href={`https://youtube.com/channel/${channelId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="sm"
              className="border-[#2a2b35] bg-transparent text-gray-400 hover:text-white hover:bg-[#1e2028]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(channelId)}
            disabled={isDeleting}
            className="border-red-900/50 bg-transparent text-red-400 hover:bg-red-950/50 hover:text-red-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Videos table */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            No videos found for this channel
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[#1e2028] hover:bg-transparent">
                <TableHead className="text-gray-400 text-xs font-medium">Video</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Views</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Uploaded</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow
                  key={video.id}
                  className="border-[#1e2028]/50 hover:bg-[#1a1b24] transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={video.thumbnail}
                        alt=""
                        className="w-24 h-14 object-cover rounded-md shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-white font-medium truncate max-w-[300px]">
                          {video.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{video.video_id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-400">
                    {video.views?.toLocaleString() || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-400">
                    {format(new Date(video.uploaded_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteVideo(video.id)}
                      className="text-gray-500 hover:text-red-400 hover:bg-red-950/30 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ScrollArea>
    </>
  );
};

// ─── Deleted Items Panel ────────────────────────────────────────────
const DeletedItemsPanel = ({
  deletedChannels,
  deletedVideos,
  onRestore,
}: {
  deletedChannels: any[];
  deletedVideos: any[];
  onRestore: (type: "channel" | "video", id: string) => void;
}) => {
  const [subTab, setSubTab] = useState<"channels" | "videos">("channels");

  return (
    <Card className="h-[calc(100vh-13rem)]">
      <div className="p-4 border-b border-[#1e2028] flex items-center gap-3">
        <button
          onClick={() => setSubTab("channels")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            subTab === "channels" ? "bg-[#1e2028] text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Channels ({deletedChannels.length})
        </button>
        <button
          onClick={() => setSubTab("videos")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            subTab === "videos" ? "bg-[#1e2028] text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Videos ({deletedVideos.length})
        </button>
      </div>

      <ScrollArea className="h-[calc(100%-60px)]">
        {subTab === "channels" ? (
          deletedChannels.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">No deleted channels</div>
          ) : (
            <div className="divide-y divide-[#1e2028]/50">
              {deletedChannels.map((ch) => (
                <div key={ch.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#1a1b24]">
                  <div className="flex items-center gap-3 min-w-0">
                    {ch.thumbnail_url ? (
                      <img src={ch.thumbnail_url} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#1e2028] flex items-center justify-center">
                        <Tv className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{ch.title}</p>
                      <p className="text-xs text-gray-500">
                        Deleted {format(new Date(ch.deleted_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRestore("channel", ch.channel_id)}
                    className="border-emerald-800/50 text-emerald-400 hover:bg-emerald-950/30 hover:text-emerald-300 gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore
                  </Button>
                </div>
              ))}
            </div>
          )
        ) : deletedVideos.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">No deleted videos</div>
        ) : (
          <div className="divide-y divide-[#1e2028]/50">
            {deletedVideos.map((v) => (
              <div key={v.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#1a1b24]">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={v.thumbnail} alt="" className="w-16 h-9 rounded object-cover" />
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate max-w-[400px]">{v.title}</p>
                    <p className="text-xs text-gray-500">
                      {v.channel_name} · Deleted {format(new Date(v.deleted_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRestore("video", v.id)}
                  className="border-emerald-800/50 text-emerald-400 hover:bg-emerald-950/30 hover:text-emerald-300 gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
