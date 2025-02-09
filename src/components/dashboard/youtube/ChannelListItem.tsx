
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

interface Channel {
  id: string;
  channel_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
}

interface ChannelListItemProps {
  channel: Channel;
  isDeleting: boolean;
  onSelect: (channelId: string) => void;
  onDelete: (channelId: string) => void;
  setChannelToDelete: (channelId: string | null) => void;
}

export const ChannelListItem = ({
  channel,
  isDeleting,
  onSelect,
  onDelete,
  setChannelToDelete,
}: ChannelListItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50">
      <div 
        className="flex items-center gap-4 cursor-pointer flex-1"
        onClick={() => onSelect(channel.channel_id)}
      >
        <img 
          src={channel.thumbnail_url || '/placeholder.svg'} 
          alt={channel.title}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{channel.title}</h3>
          <p className="text-sm text-gray-500 truncate max-w-[200px]">
            {channel.description || 'No description'}
          </p>
        </div>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setChannelToDelete(channel.channel_id);
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
              onClick={() => onDelete(channel.channel_id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
