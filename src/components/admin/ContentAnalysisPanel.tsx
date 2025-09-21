import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, FileText, BarChart3, RefreshCw, Play } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useVideoModeration, ModerationVideo } from '@/hooks/admin/useVideoModeration';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VideoFetchButton } from '@/components/admin/VideoFetchButton';
import { Progress } from '@/components/ui/progress';

export const ContentAnalysisPanel = () => {
  const { approved, rejected, reviewQueue, stats, isLoading, approve, reject } = useVideoModeration();
  const [selectedVideo, setSelectedVideo] = useState<ModerationVideo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const handleAnalyzeVideos = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Get pending videos that need analysis
      const { data: pendingVideos, error } = await supabase
        .from('youtube_videos')
        .select('id')
        .or('content_analysis_status.is.null,content_analysis_status.eq.pending')
        .is('deleted_at', null)
        .limit(100); // Process up to 100 videos at a time

      if (error) throw error;

      if (!pendingVideos || pendingVideos.length === 0) {
        toast.info('No videos pending analysis');
        return;
      }

      toast.info(`Processing ${pendingVideos.length} videos...`);

      // Update progress during processing
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        setAnalysisProgress((i / steps) * 100);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const { data: result, error: analysisError } = await supabase.functions.invoke('video-content-analyzer', {
        body: {
          action: 'analyze-batch',
          videoIds: pendingVideos.map(v => v.id)
        }
      });

      if (analysisError) throw analysisError;

      toast.success(`Analysis completed: ${result.results.approved} approved, ${result.results.rejected} rejected, ${result.results.manualReview} need manual review`);
      
      // Refresh data
      window.location.reload();
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze videos: ' + error.message);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const handleFixPendingVideos = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Fix videos that have been analyzed but are stuck in pending status
      const { data: result, error } = await supabase.functions.invoke('video-content-analyzer', {
        body: {
          action: 'fix-pending-videos'
        }
      });

      if (error) throw error;

      toast.success(`Fixed ${result.fixed} videos that were stuck in pending status`);
      
      // Refresh data
      window.location.reload();
    } catch (error: any) {
      console.error('Fix error:', error);
      toast.error('Failed to fix pending videos: ' + error.message);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const formatAnalysisDetails = (details: any) => {
    if (!details) {
      return {
        flaggedContent: false,
        educationalContent: false,
        inspirationalContent: false,
        flaggedKeywords: [],
        educationalKeywords: [],
        inspirationalKeywords: []
      };
    }
    
    const textAnalysis = details.textAnalysis || {};
    const keywordsFound = textAnalysis.keywords_found || {};
    
    return {
      flaggedContent: textAnalysis.flagged_content || false,
      educationalContent: textAnalysis.educational_content || false,
      inspirationalContent: textAnalysis.inspirational_content || false,
      flaggedKeywords: keywordsFound.flagged || [],
      educationalKeywords: keywordsFound.educational || [],
      inspirationalKeywords: keywordsFound.inspirational || []
    };
  };

  const VideoAnalysisDialog = ({ video }: { video: ModerationVideo }) => {
    const analysis = formatAnalysisDetails(video.analysis_details);
    const score = video.analysis_score || 0;
    
    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analysis Details: {video.title}
          </DialogTitle>
          <DialogDescription>
            AI content analysis results and reasoning
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Analysis Score</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${score >= 7 ? 'bg-green-500' : score >= 4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(score * 10, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{score.toFixed(1)}/10</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Content Status</h4>
                <Badge variant={
                  video.content_analysis_status === 'approved' ? 'default' :
                  video.content_analysis_status === 'rejected' ? 'destructive' : 'secondary'
                }>
                  {video.content_analysis_status || 'pending'}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Content Classification</h4>
              <div className="grid grid-cols-3 gap-2">
                <Badge variant={analysis.educationalContent ? 'default' : 'outline'}>
                  {analysis.educationalContent ? '✓' : '✗'} Educational
                </Badge>
                <Badge variant={analysis.inspirationalContent ? 'default' : 'outline'}>
                  {analysis.inspirationalContent ? '✓' : '✗'} Inspirational
                </Badge>
                <Badge variant={analysis.flaggedContent ? 'destructive' : 'outline'}>
                  {analysis.flaggedContent ? '✓' : '✗'} Flagged
                </Badge>
              </div>
            </div>

            {analysis.educationalKeywords.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Educational Keywords Found</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.educationalKeywords.map((keyword: string, i: number) => (
                    <Badge key={i} variant="default" className="text-xs">{keyword}</Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.inspirationalKeywords.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Inspirational Keywords Found</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.inspirationalKeywords.map((keyword: string, i: number) => (
                    <Badge key={i} variant="default" className="text-xs">{keyword}</Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.flaggedKeywords.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Flagged Keywords Found</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.flaggedKeywords.map((keyword: string, i: number) => (
                    <Badge key={i} variant="destructive" className="text-xs">{keyword}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">AI Reasoning</h4>
              <p className="text-sm text-muted-foreground p-2 bg-muted rounded">
                {video.reasoning || 'No specific reasoning provided'}
              </p>
            </div>
            
            <div className="flex gap-2 pt-4">
              {video.content_analysis_status !== 'approved' && (
                <Button onClick={() => approve(video)} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Video
                </Button>
              )}
              {video.content_analysis_status !== 'rejected' && (
                <Button variant="destructive" onClick={() => reject(video)} className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Video
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    );
  };

  const VideoCard = ({ video, showActions = true }: { video: ModerationVideo; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <img 
            src={video.thumbnail || '/placeholder.svg'} 
            alt={video.title}
            className="w-24 h-16 object-cover rounded"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h4>
            <p className="text-xs text-muted-foreground mb-2">{video.channel_name}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={
                  video.content_analysis_status === 'approved' ? 'default' :
                  video.content_analysis_status === 'rejected' ? 'destructive' : 'secondary'
                } className="text-xs">
                  {video.content_analysis_status || 'pending'}
                </Badge>
                {video.analysis_score && (
                  <span className="text-xs text-muted-foreground">
                    Score: {video.analysis_score.toFixed(1)}
                  </span>
                )}
              </div>
              
              <div className="flex gap-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <VideoAnalysisDialog video={video} />
                </Dialog>
                
                {showActions && (
                  <>
                    {video.content_analysis_status !== 'approved' && (
                      <Button variant="ghost" size="sm" onClick={() => approve(video)}>
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    )}
                    {video.content_analysis_status !== 'rejected' && (
                      <Button variant="ghost" size="sm" onClick={() => reject(video)}>
                        <XCircle className="h-3 w-3" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading content analysis data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                AI Content Analysis
              </CardTitle>
              <CardDescription>
                Automated content filtering and moderation system
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <VideoFetchButton onFetchComplete={() => window.location.reload()} />
              <Button onClick={handleAnalyzeVideos} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Analyze New Videos
                  </>
                )}
              </Button>
              {stats.pending > 100 && (
                <Button 
                  onClick={handleFixPendingVideos} 
                  disabled={isAnalyzing}
                  variant="destructive"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Fixing...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Fix {stats.pending} Pending Videos
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Analyzing videos...</span>
                <span>{analysisProgress.toFixed(0)}%</span>
              </div>
              <Progress value={analysisProgress} />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Videos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending Analysis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.manualReview}</div>
              <div className="text-sm text-muted-foreground">Manual Review</div>
            </div>
          </div>

          {/* AI System Status */}
          <div className="border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">AI Filtering System Status</h3>
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Active & Processing New Videos
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>✅ <strong>Rejected videos are HIDDEN from public users</strong></p>
              <p>✅ <strong>Only approved videos appear in search and on the site</strong></p>
              <p>✅ <strong>All new videos are automatically filtered before display</strong></p>
              <p>✅ <strong>Educational/religious content gets auto-approved</strong></p>
              <p>⚠️ <strong>Ambiguous content requires manual review</strong></p>
              
              {stats.pending > 100 && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                    ⚠️ <strong>{stats.pending.toLocaleString()} videos are stuck in pending status</strong>
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
                    These videos were analyzed but not properly categorized. Click "Fix Pending Videos" to resolve this automatically.
                    This is a one-time fix needed due to a previous system update.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="review" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="review" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Review Queue ({reviewQueue.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({rejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Videos requiring manual review or pending analysis
          </div>
          {reviewQueue.length > 0 ? (
            <div className="grid gap-4">
              {reviewQueue.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No videos pending review
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Videos approved by AI analysis (visible to users)
          </div>
          {approved.length > 0 ? (
            <div className="grid gap-4">
              {approved.slice(0, 20).map((video) => (
                <VideoCard key={video.id} video={video} showActions={false} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No approved videos found
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Videos rejected by AI analysis (hidden from users)
          </div>
          {rejected.length > 0 ? (
            <div className="grid gap-4">
              {rejected.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No rejected videos found
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentAnalysisPanel;