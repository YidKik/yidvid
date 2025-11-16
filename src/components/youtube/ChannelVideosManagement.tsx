
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VideoTableRow } from "./channel-videos/VideoTableRow";
import { useVideoManagement } from "./channel-videos/useVideoManagement";
import { AlertCircle, Loader2 } from "lucide-react";

interface ChannelVideosManagementProps {
  channelId: string;
}

export const ChannelVideosManagement = ({ channelId }: ChannelVideosManagementProps) => {
  const {
    videos,
    isLoading,
    isError,
    error,
    isDeleting,
    videoToDelete,
    refetch,
    handleDeleteVideo,
    setVideoToDelete,
  } = useVideoManagement(channelId);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading videos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive font-medium mb-2">Error loading videos</p>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "Please try again later."}
        </p>
        <Button 
          variant="outline" 
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!videos?.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No videos found for this channel.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Channel Videos</h2>
        <p className="text-sm text-muted-foreground">{videos.length} videos found</p>
      </div>
      <ScrollArea className="h-[60vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos?.map((video) => (
              <VideoTableRow
                key={video.id}
                video={video}
                isDeleting={isDeleting && videoToDelete === video.id}
                onDeleteClick={() => {
                  setVideoToDelete(video.id);
                  handleDeleteVideo(video.id);
                }}
                onCancelDelete={() => setVideoToDelete(null)}
              />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};
