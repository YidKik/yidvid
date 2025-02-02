import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/navigation/BackButton";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { UserManagementSection } from "@/components/dashboard/UserManagementSection";
import { YouTubeChannelsSection } from "@/components/dashboard/YouTubeChannelsSection";
import { MusicArtistsSection } from "@/components/dashboard/MusicArtistsSection";
import { CommentsManagementSection } from "@/components/dashboard/CommentsManagementSection";
import { ReportedVideosSection } from "@/components/dashboard/ReportedVideosSection";
import { ChannelRequestsSection } from "@/components/dashboard/ChannelRequestsSection";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, Music, Video, MessageSquare, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPage, setSelectedPage] = useState("/");

  // Check if user is admin
  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !data?.is_admin) {
        navigate("/");
        return null;
      }

      return data;
    },
  });

  const handleDownloadPDF = async () => {
    try {
      const loadingToast = toast.loading("Preparing PDF download...");
      
      // Navigate to the selected page first
      if (selectedPage !== window.location.pathname) {
        navigate(selectedPage);
        
        // For homepage, wait for videos to be fetched
        if (selectedPage === "/") {
          // Wait for initial page render
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check if videos are still loading
          const videoGrid = document.querySelector('.video-grid');
          if (videoGrid) {
            // Wait for skeleton loaders to disappear
            let attempts = 0;
            while (attempts < 10 && videoGrid.querySelector('.skeleton')) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              attempts++;
            }
          }
          
          // Additional wait to ensure all images are loaded
          await new Promise(resolve => {
            const images = document.querySelectorAll('img');
            let loadedImages = 0;
            
            images.forEach(img => {
              if (img.complete) {
                loadedImages++;
              } else {
                img.addEventListener('load', () => {
                  loadedImages++;
                  if (loadedImages === images.length) {
                    resolve(true);
                  }
                });
              }
            });
            
            if (loadedImages === images.length) {
              resolve(true);
            }
          });
        } else {
          // For other pages, wait for general content load
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      const element = document.getElementById('root');
      if (!element) {
        toast.error("Could not find page content");
        toast.dismiss(loadingToast);
        return;
      }
      
      // Scroll to top before capture
      window.scrollTo(0, 0);
      
      const canvas = await html2canvas(element, {
        logging: false,
        useCORS: true,
        scrollY: -window.scrollY,
        windowHeight: element.scrollHeight
      });
      
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      doc.save(`page-snapshot.pdf`);
      
      toast.dismiss(loadingToast);
      toast.success("PDF downloaded successfully");
      
      // Navigate back to dashboard if we left it
      if (selectedPage !== '/dashboard') {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF");
    }
  };

  // Fetch notification counts
  const { data: notificationCounts } = useQuery({
    queryKey: ["notification-counts"],
    queryFn: async () => {
      const [channelRequests, unreadComments] = await Promise.all([
        supabase
          .from("channel_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("admin_notifications")
          .select("id", { count: "exact", head: true })
          .eq("type", "new_comment")
          .eq("is_read", false)
      ]);

      return {
        overview: (channelRequests.count || 0),
        comments: (unreadComments.count || 0)
      };
    },
    enabled: !!profile?.is_admin,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (!profile?.is_admin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <BackButton />
        <div className="flex flex-col gap-2 items-end">
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Download PDF
          </Button>
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select page to download" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="/">Home Page</SelectItem>
              <SelectItem value="/dashboard">Dashboard</SelectItem>
              <SelectItem value="/search">Search Page</SelectItem>
              <SelectItem value="/settings">Settings</SelectItem>
              <SelectItem value="/video/example">Video Page</SelectItem>
              <SelectItem value="/channel/example">Channel Page</SelectItem>
              <SelectItem value="/music/example">Music Page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="flex justify-center w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl">
          <TabsList className="grid w-full grid-cols-5 gap-4">
            <TabsTrigger value="overview" className="flex items-center gap-2 px-6 relative">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
              {notificationCounts?.overview > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCounts.overview}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 px-6">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2 px-6">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">YouTube</span>
            </TabsTrigger>
            <TabsTrigger value="music" className="flex items-center gap-2 px-6">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Music</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2 px-6 relative">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Comments</span>
              {notificationCounts?.comments > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCounts.comments}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-6">
        {renderActiveSection()}
      </div>
    </div>
  );

  function renderActiveSection() {
    switch (activeTab) {
      case "overview":
        return (
          <div id="overview">
            <DashboardAnalytics />
            <ChannelRequestsSection />
          </div>
        );
      case "users":
        return <div id="users"><UserManagementSection currentUserId={profile.id} /></div>;
      case "youtube":
        return <div id="youtube"><YouTubeChannelsSection /></div>;
      case "music":
        return <div id="music"><MusicArtistsSection /></div>;
      case "comments":
        return (
          <div id="comments">
            <CommentsManagementSection />
            <ReportedVideosSection />
          </div>
        );
      default:
        return null;
    }
  }
};

export default Dashboard;
