
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { VideoTableProps } from "@/types/admin";
import { useState } from "react";

export function VideosTable({ videos, isDeleting, onDeleteVideo }: VideoTableProps) {
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thumbnail</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Views</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos?.map((video) => (
            <TableRow key={video.id}>
              <TableCell>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-24 h-16 object-cover rounded"
                />
              </TableCell>
              <TableCell className="font-medium max-w-[300px] truncate">
                {video.title}
              </TableCell>
              <TableCell>{video.channel_name}</TableCell>
              <TableCell>
                {format(new Date(video.uploaded_at), "PPP")}
              </TableCell>
              <TableCell>{video.views?.toLocaleString() || 0}</TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isDeleting}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setVideoToDelete(video.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Video</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this video? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setVideoToDelete(null)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => videoToDelete && onDeleteVideo(videoToDelete)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
