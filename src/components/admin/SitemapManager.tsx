import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { useVideos } from "@/hooks/video/useVideos";
import { downloadSitemap, getSitemapStats } from "@/utils/sitemapGenerator";
import { useToast } from "@/hooks/use-toast";

export const SitemapManager = () => {
  const { data: videos = [], isLoading } = useVideos();
  const { toast } = useToast();
  
  const handleDownloadSitemap = () => {
    try {
      downloadSitemap(videos);
      toast({
        title: "Sitemap Generated",
        description: "Your sitemap.xml has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate sitemap. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const stats = videos.length > 0 ? getSitemapStats(videos) : null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Sitemap Generator
        </CardTitle>
        <CardDescription>
          Generate and download an updated sitemap.xml file with all your videos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total URLs</p>
              <p className="text-2xl font-bold">{stats.totalUrls}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Static Pages</p>
              <p className="text-2xl font-bold">{stats.staticPages}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Video Pages</p>
              <p className="text-2xl font-bold">{stats.videoPages}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <Button 
            onClick={handleDownloadSitemap}
            disabled={isLoading || videos.length === 0}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Updated Sitemap
          </Button>
          
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Next Steps
            </h4>
            <ol className="text-sm space-y-1 ml-6 list-decimal">
              <li>Download the sitemap using the button above</li>
              <li>Replace the <code className="bg-muted px-1 rounded">public/sitemap.xml</code> file with the downloaded file</li>
              <li>Deploy your site to update the sitemap</li>
              <li>Submit to Google Search Console</li>
            </ol>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Submit to Search Engines
          </h4>
          <div className="text-sm space-y-2">
            <p><strong>Google Search Console:</strong></p>
            <a 
              href="https://search.google.com/search-console" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline block ml-4"
            >
              → Submit sitemap at search.google.com/search-console
            </a>
            
            <p className="mt-3"><strong>Bing Webmaster Tools:</strong></p>
            <a 
              href="https://www.bing.com/webmasters" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline block ml-4"
            >
              → Submit sitemap at bing.com/webmasters
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
