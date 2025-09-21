import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Play, Pause, Filter, Eye, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useVideoModeration } from '@/hooks/admin/useVideoModeration';
import { VideoModerationList } from '@/components/admin/VideoModerationList';
import { VideoFetchButton } from '@/components/admin/VideoFetchButton';

interface AnalysisStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  manualReview: number;
}

interface BatchAnalysisResult {
  success: boolean;
  processed: number;
  batchResults: {
    total: number;
    approved: number;
    rejected: number;
    manualReview: number;
    errors: number;
  };
  initialStats: AnalysisStats;
  finalStats: AnalysisStats;
}

export const ContentAnalysisPanel: React.FC = () => {
  const { user } = useAuth();
  const { approved, rejected, reviewQueue, stats, isLoading: isModerationLoading, approve, reject } = useVideoModeration();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [lastAnalysis, setLastAnalysis] = useState<BatchAnalysisResult | null>(null);

  const fetchStats = async () => {
    // Stats are now handled by useVideoModeration hook
    console.log('Stats refreshed from database');
    toast.success('AI filtering stats refreshed');
  };

  const handleAnalyzeExisting = async () => {
    if (!user) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      toast.info('Starting batch analysis of pending videos...');
      
      // Get list of pending video IDs
      const { data: pendingVideos, error: fetchError } = await supabase
        .from('youtube_videos')
        .select('id')
        .or('content_analysis_status.is.null,content_analysis_status.eq.pending')
        .is('deleted_at', null)
        .limit(50); // Process up to 50 videos at a time
      
      if (fetchError) {
        throw new Error(`Failed to fetch pending videos: ${fetchError.message}`);
      }

      if (!pendingVideos || pendingVideos.length === 0) {
        toast.info('No pending videos found to analyze');
        return;
      }

      const initialStats = stats || { total: 0, pending: 0, approved: 0, rejected: 0, manualReview: 0 };
      
      // Call the video content analyzer edge function
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('video-content-analyzer', {
        body: {
          action: 'analyze-batch',
          videoIds: pendingVideos.map(v => v.id)
        }
      });

      if (analysisError) {
        throw new Error(`Analysis failed: ${analysisError.message}`);
      }

      // Update progress during processing
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        setAnalysisProgress((i / steps) * 100);
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      const result: BatchAnalysisResult = {
        success: analysisResult.success,
        processed: analysisResult.results.processed,
        batchResults: {
          total: analysisResult.results.processed,
          approved: analysisResult.results.approved,
          rejected: analysisResult.results.rejected,
          manualReview: analysisResult.results.manualReview,
          errors: analysisResult.results.errors
        },
        initialStats,
        finalStats: {
          total: initialStats.total,
          pending: Math.max(0, initialStats.pending - analysisResult.results.processed),
          approved: initialStats.approved + analysisResult.results.approved,
          rejected: initialStats.rejected + analysisResult.results.rejected,
          manualReview: initialStats.manualReview + analysisResult.results.manualReview
        }
      };

      setLastAnalysis(result);
      
      toast.success(
        `Analysis complete! Processed ${result.processed} videos. ` +
        `Approved: ${result.batchResults.approved}, ` +
        `Rejected: ${result.batchResults.rejected}, ` +
        `Manual Review: ${result.batchResults.manualReview}`
      );

      // Refresh the moderation data
      window.location.reload();

    } catch (error) {
      console.error('Error in batch analysis:', error);
      toast.error(`Batch analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'manual_review':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default' as const;
      case 'rejected':
        return 'destructive' as const;
      case 'manual_review':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            AI Content Analysis Dashboard
          </CardTitle>
          <CardDescription>
            Monitor and manage the AI-powered kosher content filtering system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {isModerationLoading ? '...' : stats?.total || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Videos</div>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon('pending')}
                <div className="text-2xl font-bold text-foreground">
                  {isModerationLoading ? '...' : stats?.pending || 0}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>

            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon('approved')}
                <div className="text-2xl font-bold text-green-600">
                  {isModerationLoading ? '...' : stats?.approved || 0}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>

            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon('rejected')}
                <div className="text-2xl font-bold text-red-600">
                  {isModerationLoading ? '...' : stats?.rejected || 0}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>

            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon('manual_review')}
                <div className="text-2xl font-bold text-yellow-600">
                  {isModerationLoading ? '...' : stats?.manualReview || 0}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Manual Review</div>
            </div>
          </div>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analyzing videos...</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <VideoFetchButton onFetchComplete={() => window.location.reload()} />
            
            <Button
              onClick={fetchStats}
              disabled={isModerationLoading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isModerationLoading ? 'animate-spin' : ''}`} />
              Refresh Stats
            </Button>

            <Button
              onClick={handleAnalyzeExisting}
              disabled={isAnalyzing || !stats?.pending}
            >
              {isAnalyzing ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Analyze Pending Videos ({stats?.pending || 0})
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                // Navigate to manual review queue (implement as needed)
                toast.info('Manual review interface coming soon');
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Review Queue ({stats?.manualReview || 0})
            </Button>
          </div>

          {/* Last Analysis Results */}
          {lastAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Last Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{lastAnalysis.processed}</div>
                    <div className="text-sm text-muted-foreground">Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{lastAnalysis.batchResults.approved}</div>
                    <div className="text-sm text-muted-foreground">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">{lastAnalysis.batchResults.rejected}</div>
                    <div className="text-sm text-muted-foreground">Rejected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-600">{lastAnalysis.batchResults.manualReview}</div>
                    <div className="text-sm text-muted-foreground">Manual Review</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filtering Status */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">AI Filtering System Status</h3>
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Active & Processing New Videos
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>✅ <strong>NEW Video Processing:</strong> All new videos from YouTube are automatically filtered</p>
              <p>✅ <strong>Content Analysis:</strong> Enhanced keyword filtering for kosher content</p>
              <p>✅ <strong>Auto-Approval:</strong> Educational/religious content gets automatically approved</p>
              <p>✅ <strong>Auto-Rejection:</strong> Inappropriate content gets automatically rejected</p>
              <p>✅ <strong>Manual Review Queue:</strong> Ambiguous content requires admin review</p>
              <p>⚠️  <strong>Note:</strong> Only NEW videos are processed. Existing videos require manual analysis.</p>
            </div>
          </div>

          {/* Moderation Lists */}
          <div className="space-y-6">
            <VideoModerationList
              title="Manual Review Queue"
              videos={reviewQueue}
              emptyText="No videos awaiting manual review."
              primaryAction={{ label: "Approve", onClick: approve }}
              secondaryAction={{ label: "Reject", onClick: reject, variant: "outline" }}
            />

            <VideoModerationList
              title="Approved Videos"
              videos={approved}
              emptyText="No approved videos yet."
              secondaryAction={{ label: "Reject", onClick: reject, variant: "destructive" }}
            />

            <VideoModerationList
              title="Rejected Videos"
              videos={rejected}
              emptyText="No rejected videos."
              primaryAction={{ label: "Approve", onClick: approve }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};