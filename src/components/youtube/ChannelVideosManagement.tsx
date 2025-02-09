
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

interface ChannelVideosManagementProps {
  channelId: string;
}

export const ChannelVideosManagement = ({ channelId }: ChannelVideosManagementProps) => {
  const {
    videos,
    isLoading,
    isError,
    isDeleting,
    videoToDelete,
    refetch,
    handleDeleteVideo,
    setVideoToDelete,
  } = useVideoManagement(channelId);

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Loading videos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading videos. Please try again later.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!videos?.length) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">No videos found for this channel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Channel Videos</h2>
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
                isDeleting={isDeleting}
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
