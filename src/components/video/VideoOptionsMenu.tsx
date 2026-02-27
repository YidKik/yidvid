import { useState } from "react";
import { MoreVertical, Heart, Clock, ListPlus, Check, Plus, LogIn } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useVideoLibrary } from "@/hooks/useVideoLibrary";
import { useSessionManager } from "@/hooks/useSessionManager";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VideoOptionsMenuProps {
  videoId: string;
  variant?: "icon" | "overlay";
  className?: string;
}

export const VideoOptionsMenu = ({ videoId, variant = "icon", className }: VideoOptionsMenuProps) => {
  const { isAuthenticated, session } = useSessionManager();
  const userId = session?.user?.id;
  const {
    playlists,
    isInFavorites,
    isInWatchLater,
    toggleFavorite,
    toggleWatchLater,
    createPlaylist,
    addToPlaylist,
  } = useVideoLibrary(userId);

  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to add favorites", { icon: <LogIn className="w-4 h-4" /> });
      return;
    }
    toggleFavorite.mutate(videoId);
  };

  const handleToggleWatchLater = () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to add to Watch Later", { icon: <LogIn className="w-4 h-4" /> });
      return;
    }
    toggleWatchLater.mutate(videoId);
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to use playlists", { icon: <LogIn className="w-4 h-4" /> });
      return;
    }
    addToPlaylist.mutate({ playlistId, videoId });
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    createPlaylist.mutate(
      { title: newPlaylistName.trim() },
      {
        onSuccess: (playlist) => {
          addToPlaylist.mutate({ playlistId: playlist.id, videoId });
          setShowCreatePlaylist(false);
          setNewPlaylistName("");
        },
      }
    );
  };

  const isFavorite = isInFavorites(videoId);
  const isWatchLaterSaved = isInWatchLater(videoId);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full transition-colors duration-200",
              variant === "overlay" && "bg-[#1A1A1A] hover:bg-[#FFCC00] text-white hover:text-[#1A1A1A]",
              variant === "icon" && "hover:bg-[#F0F0F0]",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-white border border-[#E5E5E5] shadow-lg rounded-xl z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            onClick={handleToggleFavorite}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-[#F0F0F0] rounded-lg"
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-[#FF0000] text-[#FF0000]")} />
            <span>{isFavorite ? "Remove from Favorites" : "Add to Favorites"}</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={handleToggleWatchLater}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-100 rounded-lg"
          >
            <Clock className={cn("w-4 h-4", isWatchLaterSaved && "fill-blue-500 text-blue-500")} />
            <span>{isWatchLaterSaved ? "Remove from Watch Later" : "Add to Watch Later"}</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-100 rounded-lg">
              <ListPlus className="w-4 h-4" />
              <span>Add to Playlist</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-white border border-gray-200 shadow-lg rounded-xl w-52">
              {playlists && playlists.length > 0 ? (
                <>
                  {playlists.map((playlist) => (
                    <DropdownMenuItem
                      key={playlist.id}
                      onClick={() => handleAddToPlaylist(playlist.id)}
                      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-100 rounded-lg"
                    >
                      <ListPlus className="w-4 h-4" />
                      <span className="truncate">{playlist.title}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              ) : null}
              <DropdownMenuItem
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.info("Please sign in to create playlists", { icon: <LogIn className="w-4 h-4" /> });
                    return;
                  }
                  setShowCreatePlaylist(true);
                }}
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-100 rounded-lg text-gray-700"
              >
                <Plus className="w-4 h-4" />
                <span>Create new playlist</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Playlist Dialog */}
      <Dialog open={showCreatePlaylist} onOpenChange={setShowCreatePlaylist}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="rounded-xl border-gray-300"
              onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowCreatePlaylist(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlaylist}
              disabled={!newPlaylistName.trim() || createPlaylist.isPending}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
            >
              Create & Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
