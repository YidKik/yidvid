import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, XCircle, Clock, AlertTriangle, Eye, Search,
  TrendingUp, TrendingDown, Shield, Image as ImageIcon,
  FileVideo, Zap
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channel_name: string;
  content_analysis_status: string;
  analysis_score: number;
  analysis_details: any;
  manual_review_required: boolean;
  analysis_timestamp: string;
}

export const ContentAnalysisTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["video-moderation-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("content_analysis_status, analysis_score, manual_review_required");
      
      if (error) throw error;
      
      const total = data.length;
      const pending = data.filter(v => v.content_analysis_status === 'pending' || !v.content_analysis_status).length;
      const approved = data.filter(v => v.content_analysis_status === 'approved').length;
      const rejected = data.filter(v => v.content_analysis_status === 'rejected').length;
      const manualReview = data.filter(v => v.manual_review_required).length;
      
      const avgScore = data.reduce((sum, v) => sum + (v.analysis_score || 0), 0) / total;
      
      return { total, pending, approved, rejected, manualReview, avgScore };
    },
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["moderation-videos", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("youtube_videos")
        .select("*")
        .order("analysis_timestamp", { ascending: false, nullsFirst: false })
        .limit(100);
      
      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Video[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from("youtube_videos")
        .update({ 
          content_analysis_status: 'approved',
          manual_review_required: false,
          deleted_at: null
        })
        .eq("id", videoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation-videos"] });
      queryClient.invalidateQueries({ queryKey: ["video-moderation-stats"] });
      toast.success("Video approved successfully");
      setSelectedVideo(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from("youtube_videos")
        .update({ 
          content_analysis_status: 'rejected',
          manual_review_required: false,
          deleted_at: new Date().toISOString()
        })
        .eq("id", videoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation-videos"] });
      queryClient.invalidateQueries({ queryKey: ["video-moderation-stats"] });
      toast.success("Video rejected successfully");
      setSelectedVideo(null);
    },
  });

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <Card className={`border-l-4 ${color}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend)}% from last week
              </p>
            )}
          </div>
          <Icon className={`h-12 w-12 opacity-20`} />
        </div>
      </CardContent>
    </Card>
  );

  const VideoCard = ({ video, onClick }: { video: Video; onClick: () => void }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'approved': return 'bg-green-100 text-green-800 border-green-300';
        case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
        case 'manual_review': return 'bg-orange-100 text-orange-800 border-orange-300';
        default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      }
    };

    const getRejectionReason = () => {
      if (!video.analysis_details) return null;
      
      try {
        const details = typeof video.analysis_details === 'string' 
          ? JSON.parse(video.analysis_details) 
          : video.analysis_details;
        
        const reasons = [];
        
        // Get thumbnail rejection reason
        if (details.thumbnailAnalysis?.rejection_reason) {
          reasons.push(details.thumbnailAnalysis.rejection_reason);
        }
        
        // Get video frame issues
        if (details.videoAnalysis?.problematic_frames && details.videoAnalysis.problematic_frames.length > 0) {
          const frameIssues = details.videoAnalysis.problematic_frames
            .flatMap((f: any) => f.issues || [])
            .slice(0, 2); // Show first 2 issues
          if (frameIssues.length > 0) {
            reasons.push(...frameIssues);
          }
        }
        
        // Get general reasoning
        if (details.reasoning && !reasons.length) {
          reasons.push(details.reasoning);
        }
        
        return reasons.length > 0 ? reasons[0] : null; // Show first reason
      } catch {
        return null;
      }
    };

    const rejectionReason = getRejectionReason();

    return (
      <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4" onClick={onClick}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative w-48 h-28 flex-shrink-0">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-full object-cover rounded-lg"
              />
              {video.manual_review_required && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-xs font-semibold">Review</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-base line-clamp-2 mb-1">{video.title}</h4>
              <p className="text-sm text-muted-foreground truncate mb-3">{video.channel_name}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${getStatusColor(video.content_analysis_status || 'pending')} border`}>
                  {video.content_analysis_status || 'pending'}
                </Badge>
                
                {video.analysis_score !== null && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {(video.analysis_score * 100).toFixed(0)}% confidence
                  </Badge>
                )}
              </div>
              
              {rejectionReason && (
                <div className="mt-2 p-3 bg-red-50 rounded-lg border-l-3 border-red-400">
                  <p className="text-xs font-semibold text-red-800 mb-1">🚫 Reason:</p>
                  <p className="text-xs text-red-700 line-clamp-2">
                    {rejectionReason}
                  </p>
                </div>
              )}
              
              {video.analysis_timestamp && (
                <p className="text-xs text-muted-foreground mt-2">
                  Analyzed: {new Date(video.analysis_timestamp).toLocaleString()}
                </p>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <Eye className="h-3 w-3 mr-1" />
                View Full Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const VideoDetailsDialog = ({ video, onClose }: { video: Video | null; onClose: () => void }) => {
    if (!video) return null;
    
    let details = null;
    try {
      details = typeof video.analysis_details === 'string' 
        ? JSON.parse(video.analysis_details) 
        : video.analysis_details;
    } catch {}

    const getRejectionReason = () => {
      if (!details) return 'No analysis details available';
      
      const reasons = [];
      if (details.thumbnailAnalysis?.rejection_reason) {
        reasons.push(details.thumbnailAnalysis.rejection_reason);
      }
      if (details.videoAnalysis?.problematic_frames && details.videoAnalysis.problematic_frames.length > 0) {
        reasons.push(`${details.videoAnalysis.problematic_frames.length} problematic frame(s) detected in video`);
      }
      if (details.reasoning) {
        reasons.push(details.reasoning);
      }
      
      return reasons.length > 0 ? reasons.join(' ') : 'No specific reason provided';
    };

    return (
      <Dialog open={!!video} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              AI Analysis Details - Detailed Review
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Video Info */}
            <div>
              <img src={video.thumbnail} alt={video.title} className="w-full rounded-lg shadow-md" />
              <h3 className="font-bold text-lg mt-4">{video.title}</h3>
              <p className="text-muted-foreground">{video.channel_name}</p>
            </div>

            {/* Rejection Reason Card */}
            {(video.content_analysis_status === 'rejected' || video.manual_review_required) && (
              <Card className="border-2 border-red-500 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    Rejection / Review Reason
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-900 font-medium whitespace-pre-wrap">
                    {getRejectionReason()}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={`text-sm ${
                    video.content_analysis_status === 'approved' ? 'bg-green-100 text-green-800' :
                    video.content_analysis_status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {video.content_analysis_status || 'pending'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Confidence Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {video.analysis_score !== null ? (video.analysis_score * 100).toFixed(0) + '%' : 'N/A'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Analyzed On</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {video.analysis_timestamp ? new Date(video.analysis_timestamp).toLocaleString() : 'N/A'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {details && (
              <>
                {/* Thumbnail Analysis */}
                {details.thumbnailAnalysis && (
                  <Card className="border-2 border-blue-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Thumbnail Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {details.thumbnailAnalysis.rejection_reason && (
                        <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                          <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason:</p>
                          <p className="text-sm text-red-700">{details.thumbnailAnalysis.rejection_reason}</p>
                        </div>
                      )}
                      
                      {details.thumbnailAnalysis.faces && details.thumbnailAnalysis.faces.length > 0 && (
                        <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                          <p className="text-sm font-semibold text-orange-800 mb-1">👤 Faces Detected:</p>
                          <p className="text-sm text-orange-700">
                            {details.thumbnailAnalysis.faces.length} face(s) found in thumbnail
                          </p>
                          <p className="text-xs text-orange-600 mt-2">
                            ⚠️ All videos with detected faces (especially women/girls) are automatically flagged for review
                          </p>
                        </div>
                      )}
                      
                      {details.thumbnailAnalysis.score !== undefined && (
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Safety Score:</span> {(details.thumbnailAnalysis.score * 100).toFixed(0)}%</p>
                          <p><span className="font-medium">Status:</span> {details.thumbnailAnalysis.safe ? '✅ Safe' : '❌ Unsafe'}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Video Frame Analysis with Problematic Frames */}
                {details.videoAnalysis && (
                  <Card className="border-2 border-purple-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileVideo className="h-4 w-4" />
                        Video Frame Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Frames Analyzed:</p>
                          <p className="text-2xl font-bold">{details.videoAnalysis.frames_analyzed || 0}</p>
                        </div>
                        <div>
                          <p className="font-medium">Issues Detected:</p>
                          <p className="text-2xl font-bold text-red-600">
                            {details.videoAnalysis.issues_detected?.length || 0}
                          </p>
                        </div>
                      </div>

                      {details.videoAnalysis.issues_detected && details.videoAnalysis.issues_detected.length > 0 && (
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-sm font-semibold text-red-800 mb-2">Issues Found:</p>
                          <div className="flex flex-wrap gap-2">
                            {details.videoAnalysis.issues_detected.map((issue: string, idx: number) => (
                              <Badge key={idx} variant="destructive">{issue.replace('_', ' ')}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Problematic Frames Display */}
                      {details.videoAnalysis.problematic_frames && details.videoAnalysis.problematic_frames.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-red-800">🚫 Problematic Frames Detected:</h4>
                            <Badge variant="destructive">
                              {details.videoAnalysis.problematic_frames.length} frame(s)
                            </Badge>
                          </div>
                          
                          <div className="space-y-4">
                            {details.videoAnalysis.problematic_frames.map((frame: any, idx: number) => (
                              <Card key={idx} className="border-2 border-red-200 bg-red-50/50">
                                <CardContent className="p-4">
                                  <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                      <img 
                                        src={frame.frameUrl || video.thumbnail} 
                                        alt={`Frame at ${frame.time}s`}
                                        className="w-32 h-20 object-cover rounded border-2 border-red-300"
                                      />
                                      <p className="text-xs text-center mt-1 font-medium">
                                        @ {frame.time?.toFixed(1)}s
                                      </p>
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-red-800 mb-2">
                                        Issues in this frame:
                                      </p>
                                      <ul className="text-sm space-y-1">
                                        {frame.issues?.map((issue: string, issueIdx: number) => (
                                          <li key={issueIdx} className="text-red-700 flex items-start gap-2">
                                            <span className="text-red-500">•</span>
                                            <span>{issue}</span>
                                          </li>
                                        ))}
                                      </ul>
                                      {frame.faces > 0 && (
                                        <p className="text-xs text-orange-600 mt-2">
                                          👤 {frame.faces} face(s) detected in this frame
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          
                          <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                            <p className="text-xs text-orange-800">
                              <strong>Note:</strong> These frames show where women, girls, or inappropriate content was detected. 
                              The AI automatically flags any video with female presence for manual review to ensure compliance 
                              with content guidelines.
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t">
              <Button 
                onClick={() => approveMutation.mutate(video.id)}
                disabled={approveMutation.isPending}
                className="flex-1"
                variant="default"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {approveMutation.isPending ? 'Approving...' : 'Approve Video'}
              </Button>
              
              <Button 
                onClick={() => rejectMutation.mutate(video.id)}
                disabled={rejectMutation.isPending}
                className="flex-1"
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject & Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const filteredVideos = {
    pending: videos?.filter(v => !v.content_analysis_status || v.content_analysis_status === 'pending') || [],
    manualReview: videos?.filter(v => v.manual_review_required) || [],
    approved: videos?.filter(v => v.content_analysis_status === 'approved') || [],
    rejected: videos?.filter(v => v.content_analysis_status === 'rejected') || [],
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Videos"
          value={stats?.total || 0}
          icon={FileVideo}
          color="border-l-blue-500"
        />
        <StatCard
          title="Pending Review"
          value={stats?.pending || 0}
          icon={Clock}
          color="border-l-yellow-500"
          trend={12}
        />
        <StatCard
          title="Approved"
          value={stats?.approved || 0}
          icon={CheckCircle}
          color="border-l-green-500"
          trend={8}
        />
        <StatCard
          title="Rejected"
          value={stats?.rejected || 0}
          icon={XCircle}
          color="border-l-red-500"
          trend={-5}
        />
        <StatCard
          title="Manual Review"
          value={stats?.manualReview || 0}
          icon={AlertTriangle}
          color="border-l-orange-500"
        />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Video Lists */}
      <Tabs defaultValue="manual-review" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="manual-review" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Manual Review ({filteredVideos.manualReview.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({filteredVideos.pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({filteredVideos.approved.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({filteredVideos.rejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual-review" className="space-y-3">
          {filteredVideos.manualReview.map(video => (
            <VideoCard key={video.id} video={video} onClick={() => setSelectedVideo(video)} />
          ))}
          {filteredVideos.manualReview.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No videos require manual review
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-3">
          {filteredVideos.pending.map(video => (
            <VideoCard key={video.id} video={video} onClick={() => setSelectedVideo(video)} />
          ))}
        </TabsContent>

        <TabsContent value="approved" className="space-y-3">
          {filteredVideos.approved.map(video => (
            <VideoCard key={video.id} video={video} onClick={() => setSelectedVideo(video)} />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-3">
          {filteredVideos.rejected.map(video => (
            <VideoCard key={video.id} video={video} onClick={() => setSelectedVideo(video)} />
          ))}
        </TabsContent>
      </Tabs>

      <VideoDetailsDialog video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
};
