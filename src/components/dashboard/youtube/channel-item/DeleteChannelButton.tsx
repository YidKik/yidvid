
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface DeleteChannelButtonProps {
  isDeleting: boolean;
  channelId: string;
  onDelete: (channelId: string) => void;
  setChannelToDelete: (channelId: string | null) => void;
}

export const DeleteChannelButton = ({ 
  isDeleting, 
  channelId, 
  onDelete, 
  setChannelToDelete 
}: DeleteChannelButtonProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setChannelToDelete(channelId);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Channel</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this channel? This action cannot be undone
            and will permanently remove the channel and all its videos for all users.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setChannelToDelete(null)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onDelete(channelId)}
            className="bg-destructive hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
