
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Search, Trash2, RotateCcw, Loader2, Play, Eye, Calendar, ExternalLink, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-[#1e2028] bg-[#12131a] ${className}`}>{children}</div>
);

export const ShortsPageV2 = () => {
  const { user } = useUnifiedAuth();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");
  const [selectedShort, setSelectedShort] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch active shorts
  const { data: shorts = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-shorts", activeTab],
    queryFn: async () => {
      let query = supabase
        .from("youtube_videos")
        .select("*")
        .eq("is_short", true)
        .order("uploaded_at", { ascending: false });

      if (activeTab === "active") {
        query = query.is("deleted_at", null);
      } else {
        query = query.not("deleted_at", "is", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = shorts.filter((s: any) =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.channel_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (short: any) => {
    if (!user?.id) return;
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc("admin_delete_video", {
        video_id_param: short.id,
        admin_user_id: user.id,
      });
      if (error) throw error;
      const res = data as any;
      if (!res?.success) throw new Error(res?.error);
      toast.success("Short deleted");
      refetch();
      if (selectedShort?.id === short.id) setSelectedShort(null);
    } catch (e: any) {
      toast.error("Failed: " + (e.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (short: any) => {
    if (!user?.id) return;
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc("admin_restore_video", {
        video_id_param: short.id,
        admin_user_id: user.id,
      });
      if (error) throw error;
      const res = data as any;
      if (!res?.success) throw new Error(res?.error);
      toast.success("Short restored");
      refetch();
      if (selectedShort?.id === short.id) setSelectedShort(null);
    } catch (e: any) {
      toast.error("Failed: " + (e.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Left: List */}
      <Card className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-[#1e2028] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">Shorts</h2>
              <span className="text-xs bg-[#1e2028] text-[#8b8fa3] px-2 py-0.5 rounded-full">
                {filtered.length}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#0a0b10] rounded-lg p-1">
            <button
              onClick={() => { setActiveTab("active"); setSelectedShort(null); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === "active"
                  ? "bg-[#6366f1] text-white"
                  : "text-[#8b8fa3] hover:text-white"
              }`}
            >
              Active Shorts
            </button>
            <button
              onClick={() => { setActiveTab("deleted"); setSelectedShort(null); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === "deleted"
                  ? "bg-red-500/20 text-red-400"
                  : "text-[#8b8fa3] hover:text-white"
              }`}
            >
              Deleted
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565b6e]" />
            <Input
              placeholder="Search shorts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#0a0b10] border-[#1e2028] text-white text-sm h-9 focus:border-[#6366f1]"
            />
          </div>
        </div>

        {/* Table */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 animate-spin text-[#6366f1]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-[#565b6e] text-sm">
              No {activeTab === "deleted" ? "deleted " : ""}shorts found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#1e2028] hover:bg-transparent">
                  <TableHead className="text-[#565b6e] text-[11px] uppercase tracking-wider">Thumbnail</TableHead>
                  <TableHead className="text-[#565b6e] text-[11px] uppercase tracking-wider">Title</TableHead>
                  <TableHead className="text-[#565b6e] text-[11px] uppercase tracking-wider">Channel</TableHead>
                  <TableHead className="text-[#565b6e] text-[11px] uppercase tracking-wider">Views</TableHead>
                  <TableHead className="text-[#565b6e] text-[11px] uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((short: any) => (
                  <TableRow
                    key={short.id}
                    className={`border-[#1e2028] cursor-pointer transition-colors ${
                      selectedShort?.id === short.id ? "bg-[#6366f1]/10" : "hover:bg-[#1a1c25]"
                    }`}
                    onClick={() => setSelectedShort(short)}
                  >
                    <TableCell className="py-2">
                      <div className="w-10 h-[18px] rounded overflow-hidden" style={{ aspectRatio: '9/16', width: '32px', height: '57px' }}>
                        <img src={short.thumbnail} alt="" className="w-full h-full object-cover" />
                      </div>
                    </TableCell>
                    <TableCell className="text-white text-xs max-w-[200px] truncate">{short.title}</TableCell>
                    <TableCell className="text-[#8b8fa3] text-xs">{short.channel_name}</TableCell>
                    <TableCell className="text-[#8b8fa3] text-xs">{(short.views || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      {activeTab === "active" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={(e) => { e.stopPropagation(); handleDelete(short); }}
                          disabled={isProcessing}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          onClick={(e) => { e.stopPropagation(); handleRestore(short); }}
                          disabled={isProcessing}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </Card>

      {/* Right: Detail Panel */}
      <Card className="w-[380px] shrink-0 flex flex-col">
        {selectedShort ? (
          <ScrollArea className="flex-1">
            <div className="p-5 space-y-5">
              {/* Thumbnail */}
              <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
                <img src={selectedShort.thumbnail} alt="" className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  SHORT
                </span>
              </div>

              {/* Info */}
              <div>
                <h3 className="text-white font-semibold text-sm leading-tight">{selectedShort.title}</h3>
                <p className="text-[#8b8fa3] text-xs mt-1">{selectedShort.channel_name}</p>
              </div>

              {/* Meta */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#8b8fa3]">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{(selectedShort.views || 0).toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8b8fa3]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Uploaded {format(new Date(selectedShort.uploaded_at), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8b8fa3]">
                  <Hash className="w-3.5 h-3.5" />
                  <span className="font-mono text-[10px]">{selectedShort.video_id}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs border-[#1e2028] text-[#8b8fa3] hover:text-white bg-transparent"
                  onClick={() => window.open(`https://youtube.com/shorts/${selectedShort.video_id}`, "_blank")}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  YouTube
                </Button>
                {activeTab === "active" ? (
                  <Button
                    size="sm"
                    className="flex-1 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 border-0"
                    onClick={() => handleDelete(selectedShort)}
                    disabled={isProcessing}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1 text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 border-0"
                    onClick={() => handleRestore(selectedShort)}
                    disabled={isProcessing}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Restore
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#565b6e] text-sm">
            Select a short to view details
          </div>
        )}
      </Card>
    </div>
  );
};
