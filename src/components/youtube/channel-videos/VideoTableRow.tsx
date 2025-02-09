
import { TableCell, TableRow } from "@/components/ui/table";
import { VideoDeleteDialog } from "./VideoDeleteDialog";

interface Video {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  views: number;
  uploaded_at: string;
}

interface VideoTableRowProps {
  video: Video;
  isDeleting: boolean;
  onDeleteClick: (videoId: string) => void;
  onCancelDelete: () => void;
}

export const VideoTableRow = ({ 
  video, 
  isDeleting, 
  onDeleteClick, 
  onCancelDelete 
}: VideoTableRowProps) => {
  return (
    <TableRow key={video.id}>
      <TableCell>
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-24 h-16 object-cover rounded"
        />
      </TableCell>
      <TableCell>{video.title}</TableCell>
      <TableCell>{video.views?.toLocaleString() || 0}</TableCell>
      <TableCell>
        {new Date(video.uploaded_at).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <VideoDeleteDialog
          isDeleting={isDeleting}
          onDelete={() => onDeleteClick(video.id)}
          onCancel={onCancelDelete}
        />
      </TableCell>
    </TableRow>
  );
};
