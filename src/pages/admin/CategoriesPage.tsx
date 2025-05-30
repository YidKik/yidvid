
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/navigation/BackButton";
import { VideoCategoryManagement } from "@/components/dashboard/VideoCategoryManagement";
import { ChannelCategoryManagement } from "@/components/dashboard/ChannelCategoryManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CategoriesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    videos: [],
    channels: []
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try using edge function first
      const { data: responseData, error: functionError } = await supabase.functions.invoke('get-admin-categories');
      
      if (functionError) {
        throw functionError;
      }
      
      if (responseData) {
        setData({
          videos: responseData.videos || [],
          channels: responseData.channels || []
        });
      }
    } catch (edgeFunctionError) {
      console.error("Edge function error:", edgeFunctionError);
      toast.error("Error loading data. Trying alternative method...");
      
      // Fallback to direct queries if edge function fails
      try {
        // Fetch videos
        const { data: videos, error: videosError } = await supabase
          .from("youtube_videos")
          .select("*")
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false });

        if (videosError) throw videosError;

        // Fetch channels
        const { data: channels, error: channelsError } = await supabase
          .from("youtube_channels")
          .select("*")
          .order("title", { ascending: true });

        if (channelsError) throw channelsError;

        setData({
          videos: videos || [],
          channels: channels || []
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
        setError("Failed to load category data. Please try again later.");
        toast.error("Error loading categories data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Handle refetch functions
  const refetchVideos = async () => {
    await fetchData();
    toast.success("Videos data refreshed");
  };

  const refetchChannels = async () => {
    await fetchData();
    toast.success("Channels data refreshed");
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <BackButton />
        <div className="text-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <BackButton />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Category Management</h1>
        </div>

        <Tabs defaultValue="videos" className="space-y-8">
          <TabsList className="bg-muted p-1 rounded-full w-full sm:w-auto flex justify-center gap-2">
            <TabsTrigger 
              value="videos" 
              className="rounded-full px-8 py-2.5 data-[state=active]:shadow-lg transition-all duration-200"
            >
              Videos
            </TabsTrigger>
            <TabsTrigger 
              value="channels" 
              className="rounded-full px-8 py-2.5 data-[state=active]:shadow-lg transition-all duration-200"
            >
              Channels
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <VideoCategoryManagement videos={data.videos} onUpdate={refetchVideos} />
            )}
          </TabsContent>

          <TabsContent value="channels">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <ChannelCategoryManagement channels={data.channels} onUpdate={() => {
                refetchChannels();
                refetchVideos();
              }} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
