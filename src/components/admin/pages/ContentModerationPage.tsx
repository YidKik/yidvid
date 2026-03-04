import { useState } from "react";
import { useVideoModeration, ModerationVideo } from "@/hooks/admin/useVideoModeration";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Search, Loader2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const ContentModerationPage = () => {
  const { reviewQueue, approved, rejected, stats, isLoading, approve, reject } = useVideoModeration();
  const [search, setSearch] = useState("");
  const [detailVideo, setDetailVideo] = useState<ModerationVideo | null>(null);

  const filterVideos = (list: ModerationVideo[]) =>
    list.filter((v) => v.title?.toLowerCase().includes(search.toLowerCase()) || v.channel_name?.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Stats row */}
      <div className="flex flex-wrap gap-3">
        <StatusBadge label="Pending" count={stats.pending} color="bg-[hsl(35,90%,55%)]" />
        <StatusBadge label="Manual Review" count={stats.manualReview} color="bg-[hsl(25,95%,53%)]" />
        <StatusBadge label="Approved" count={stats.approved} color="bg-[hsl(150,60%,45%)]" />
        <StatusBadge label="Rejected" count={stats.rejected} color="bg-[hsl(0,72%,51%)]" />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(220,10%,55%)]" />
        <Input placeholder="Search by title or channel..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="review" className="space-y-4">
        <TabsList>
          <TabsTrigger value="review">Review Queue ({reviewQueue.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="review">
          <VideoList videos={filterVideos(reviewQueue)} onApprove={approve} onReject={reject} onDetail={setDetailVideo} showActions />
        </TabsContent>
        <TabsContent value="approved">
          <VideoList videos={filterVideos(approved)} onApprove={approve} onReject={reject} onDetail={setDetailVideo} />
        </TabsContent>
        <TabsContent value="rejected">
          <VideoList videos={filterVideos(rejected)} onApprove={approve} onReject={reject} onDetail={setDetailVideo} showRestore />
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!detailVideo} onOpenChange={() => setDetailVideo(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Video Details</DialogTitle>
          </DialogHeader>
          {detailVideo && (
            <div className="space-y-4">
              {detailVideo.thumbnail && (
                <img src={detailVideo.thumbnail} alt="" className="w-full rounded-lg aspect-video object-cover" />
              )}
              <h3 className="font-semibold">{detailVideo.title}</h3>
              <p className="text-sm text-[hsl(220,10%,50%)]">Channel: {detailVideo.channel_name}</p>
              <p className="text-sm">
                Status: <Badge variant="outline">{detailVideo.content_analysis_status || "pending"}</Badge>
              </p>
              {detailVideo.analysis_score != null && (
                <p className="text-sm">Score: {detailVideo.analysis_score}</p>
              )}
              {detailVideo.analysis_details && (
                <pre className="text-xs bg-[hsl(220,14%,96%)] p-3 rounded-lg overflow-auto max-h-48">
                  {JSON.stringify(detailVideo.analysis_details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StatusBadge = ({ label, count, color }: { label: string; count: number; color: string }) => (
  <div className="flex items-center gap-2 bg-white border border-[hsl(220,13%,91%)] rounded-lg px-3 py-2">
    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
    <span className="text-sm text-[hsl(220,10%,40%)]">{label}</span>
    <span className="text-sm font-bold text-[hsl(220,15%,18%)]">{count}</span>
  </div>
);

const VideoList = ({
  videos,
  onApprove,
  onReject,
  onDetail,
  showActions,
  showRestore,
}: {
  videos: ModerationVideo[];
  onApprove: (v: ModerationVideo) => void;
  onReject: (v: ModerationVideo) => void;
  onDetail: (v: ModerationVideo) => void;
  showActions?: boolean;
  showRestore?: boolean;
}) => {
  if (!videos.length) {
    return <p className="text-sm text-[hsl(220,10%,55%)] py-8 text-center">No videos in this category.</p>;
  }

  return (
    <div className="bg-white rounded-xl border border-[hsl(220,13%,91%)] divide-y divide-[hsl(220,13%,93%)]">
      {videos.map((v) => (
        <div key={v.id} className="flex items-center gap-4 p-4">
          {v.thumbnail && (
            <img src={v.thumbnail} alt="" className="w-24 h-14 rounded-md object-cover shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[hsl(220,15%,18%)] truncate">{v.title}</p>
            <p className="text-xs text-[hsl(220,10%,55%)]">{v.channel_name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="ghost" onClick={() => onDetail(v)}>
              <Eye className="w-4 h-4" />
            </Button>
            {(showActions || showRestore) && (
              <Button size="sm" variant="outline" className="text-[hsl(150,60%,35%)] border-[hsl(150,60%,80%)]" onClick={() => onApprove(v)}>
                <Check className="w-4 h-4 mr-1" /> Approve
              </Button>
            )}
            {showActions && (
              <Button size="sm" variant="outline" className="text-[hsl(0,72%,51%)] border-[hsl(0,72%,85%)]" onClick={() => onReject(v)}>
                <X className="w-4 h-4 mr-1" /> Reject
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
