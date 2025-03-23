
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomCategory } from "@/types/custom-categories";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CategoryContentManagerProps {
  category: CustomCategory | null;
  onClose: () => void;
  onSave: (selectedVideos: string[], selectedChannels: string[]) => void;
  selectedVideos: string[];
  selectedChannels: string[];
  onVideoSelectionChange: (videoId: string, checked: boolean) => void;
  onChannelSelectionChange: (channelId: string, checked: boolean) => void;
}

export function CategoryContentManager({
  category,
  onClose,
  onSave,
  selectedVideos,
  selectedChannels,
  onVideoSelectionChange,
  onChannelSelectionChange,
}: CategoryContentManagerProps) {
  const { data: videos } = useQuery({
    queryKey: ["all-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .is("deleted_at", null)
        .order("title", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: channels } = useQuery({
    queryKey: ["all-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .order("title", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const handleSaveWithNotification = async () => {
    try {
      await onSave(selectedVideos, selectedChannels);
      toast.success("Category content updated. New videos from these channels will automatically be added to this category.", 
        { id: `category-content-updated-${category?.id}` });
    } catch (error) {
      console.error("Error saving category content:", error);
      toast.error("Failed to update category content", { id: "category-update-error" });
    }
  };

  if (!category) return null;

  return (
    <Dialog open={!!category} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Category Content: {category.name}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="videos" className="flex-1">Videos</TabsTrigger>
            <TabsTrigger value="channels" className="flex-1">Channels</TabsTrigger>
          </TabsList>
          <TabsContent value="videos">
            <div className="mb-2 text-sm text-gray-500">
              Manually select individual videos for this category. Videos from channels assigned to this category will be added automatically.
            </div>
            <ScrollArea className="h-[400px] w-full border rounded-md p-4">
              <div className="space-y-4">
                {videos?.map((video) => (
                  <div key={video.id} className="flex items-start space-x-4">
                    <Checkbox
                      checked={selectedVideos.includes(video.id)}
                      onCheckedChange={(checked) => {
                        onVideoSelectionChange(video.id, checked as boolean);
                      }}
                    />
                    <div className="flex-1">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-24 h-16 object-cover rounded mb-2"
                      />
                      <p className="text-sm font-medium">{video.title}</p>
                      <p className="text-sm text-gray-500">{video.channel_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="channels">
            <div className="mb-2 text-sm text-gray-500">
              Assigning channels will automatically add all existing and future videos from these channels to this category.
            </div>
            <ScrollArea className="h-[400px] w-full border rounded-md p-4">
              <div className="space-y-4">
                {channels?.map((channel) => (
                  <div key={channel.id} className="flex items-start space-x-4">
                    <Checkbox
                      checked={selectedChannels.includes(channel.channel_id)}
                      onCheckedChange={(checked) => {
                        onChannelSelectionChange(channel.channel_id, checked as boolean);
                      }}
                    />
                    <div className="flex-1">
                      <img
                        src={channel.thumbnail_url || '/placeholder.svg'}
                        alt={channel.title}
                        className="w-12 h-12 object-cover rounded-full mb-2"
                      />
                      <p className="text-sm font-medium">{channel.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveWithNotification}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
