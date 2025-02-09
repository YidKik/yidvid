
export interface Video {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  views: number;
  uploaded_at: string;
}

export interface VideoTableRowProps {
  video: Video;
  isDeleting: boolean;
  onDeleteClick: (videoId: string) => void;
  onCancelDelete: () => void;
}

export interface VideoDeleteDialogProps {
  isDeleting: boolean;
  onDelete: () => void;
  onCancel: () => void;
}
