import { Helmet } from "react-helmet";
import { SitemapManager } from "@/components/admin/SitemapManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Globe, BarChart3 } from "lucide-react";

const AdminSEO = () => {
  return (
    <>
      <Helmet>
        <title>SEO Management | YidVid Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SEO Management</h1>
          <p className="text-muted-foreground">
            Manage your site's search engine optimization and sitemap
          </p>
        </div>
        
        <div className="grid gap-6">
          <SitemapManager />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Google Search Console Setup
              </CardTitle>
              <CardDescription>
                Verify your site with Google Search Console to monitor performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Verification Methods:</h4>
                
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-sm">1. HTML Tag Method (Recommended)</p>
                  <p className="text-sm text-muted-foreground">
                    Google will provide a meta tag like:
                  </p>
                  <code className="block bg-background p-2 rounded text-xs">
                    &lt;meta name="google-site-verification" content="your-code-here" /&gt;
                  </code>
                  <p className="text-sm text-muted-foreground">
                    Add this to your site's index.html or use Helmet component
                  </p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-sm">2. Domain Name Provider</p>
                  <p className="text-sm text-muted-foreground">
                    Add a TXT record to your domain's DNS settings
                  </p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-sm">3. HTML File Upload</p>
                  <p className="text-sm text-muted-foreground">
                    Upload the provided HTML file to your public folder
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <a
                  href="https://search.google.com/search-console/welcome"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  Go to Google Search Console
                </a>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                SEO Best Practices Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>robots.txt file created and accessible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>sitemap.xml generated and submitted</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Meta tags and Open Graph tags implemented</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Schema.org structured data for videos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Google Analytics integrated</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">→</span>
                  <span>Submit sitemap to Google Search Console</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">→</span>
                  <span>Submit sitemap to Bing Webmaster Tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">→</span>
                  <span>Monitor performance and rankings</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminSEO;
