import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Play, Pause, Filter, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@/hooks/auth/useUser';

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
  const { user } = useUser();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<BatchAnalysisResult | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('content_analysis_status')
        .is('deleted_at', null);

      if (error) throw error;

      const stats: AnalysisStats = {
        total: data.length,
        pending: 0,
        approved: 0,
        rejected: 0,
        manualReview: 0
      };

      data.forEach(video => {
        const status = video.content_analysis_status || 'pending';
        if (status in stats) {
          stats[status as keyof AnalysisStats]++;
        }
      });

      setStats(stats);
    } catch (error) {
      console.error('Error fetching analysis stats:', error);
      toast.error('Failed to fetch analysis statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleAnalyzeExisting = async () => {
    if (!user) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      toast.info('Starting batch analysis of existing videos...');
      
      const { data, error } = await supabase.functions.invoke('analyze-existing-videos', {
        body: {
          batchSize: 5, // Small batch size to avoid overwhelming AI services
          maxVideos: 20, // Limit for testing
          skipAnalyzed: true,
          onlyPending: true
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setLastAnalysis(data);
      
      // Update progress
      setAnalysisProgress(100);
      
      // Refresh stats
      await fetchStats();
      
      toast.success(
        `Analysis complete! Processed ${data.processed} videos. ` +
        `Approved: ${data.batchResults.approved}, ` +
        `Rejected: ${data.batchResults.rejected}, ` +
        `Manual Review: ${data.batchResults.manualReview}`
      );

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
        return 'success' as const;
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
                {isLoadingStats ? '...' : stats?.total || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Videos</div>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon('pending')}
                <div className="text-2xl font-bold text-foreground">
                  {isLoadingStats ? '...' : stats?.pending || 0}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>

            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon('approved')}
                <div className="text-2xl font-bold text-green-600">
                  {isLoadingStats ? '...' : stats?.approved || 0}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>

            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon('rejected')}
                <div className="text-2xl font-bold text-red-600">
                  {isLoadingStats ? '...' : stats?.rejected || 0}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>

            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon('manual_review')}
                <div className="text-2xl font-bold text-yellow-600">
                  {isLoadingStats ? '...' : stats?.manualReview || 0}
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
            <Button
              onClick={fetchStats}
              disabled={isLoadingStats}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
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
              Analyze Pending Videos
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
              <Badge variant="success" className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Active
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>✅ Text Analysis: Enhanced keyword filtering</p>
              <p>✅ Thumbnail Analysis: Sightengine AI detection</p>
              <p>✅ Video Content Analysis: Frame-by-frame scanning</p>
              <p>✅ Multi-stage filtering with confidence scoring</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};