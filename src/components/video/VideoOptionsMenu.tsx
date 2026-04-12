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
  compact?: boolean;
}

export const VideoOptionsMenu = ({ videoId, variant = "icon", className, compact = false }: VideoOptionsMenuProps) => {
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
              compact ? "h-6 w-6" : "h-8 w-8",
              "rounded-full transition-colors duration-200",
              variant === "overlay" && "bg-[#1A1A1A] hover:bg-[#FFCC00] text-white hover:text-[#1A1A1A]",
              variant === "icon" && "hover:bg-[#F0F0F0]",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className={compact ? "w-3 h-3" : "w-4 h-4"} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className={cn(
            "bg-white dark:bg-[#282828] border border-[#E5E5E5] dark:border-[#3a3a3a] shadow-xl z-50 p-1",
            compact ? "w-36 rounded-lg" : "w-48 rounded-xl"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            onClick={handleToggleFavorite}
            className={cn(
              "flex items-center cursor-pointer transition-colors duration-150 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]",
              compact ? "gap-2 px-2 py-1.5 text-[11px] rounded-md" : "gap-2.5 px-2.5 py-2 text-[13px] rounded-lg"
            )}
          >
            <Heart className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5", "shrink-0", isFavorite && "fill-[#FF0000] text-[#FF0000]")} />
            <span>{isFavorite ? "Remove Favorite" : "Favorite"}</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={handleToggleWatchLater}
            className={cn(
              "flex items-center cursor-pointer transition-colors duration-150 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]",
              compact ? "gap-2 px-2 py-1.5 text-[11px] rounded-md" : "gap-2.5 px-2.5 py-2 text-[13px] rounded-lg"
            )}
          >
            <Clock className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5", "shrink-0", isWatchLaterSaved && "fill-blue-500 text-blue-500")} />
            <span>{isWatchLaterSaved ? "Remove Watch Later" : "Watch Later"}</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="my-1" />
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className={cn(
              "flex items-center cursor-pointer transition-colors duration-150 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]",
              compact ? "gap-2 px-2 py-1.5 text-[11px] rounded-md" : "gap-2.5 px-2.5 py-2 text-[13px] rounded-lg"
            )}>
              <ListPlus className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
              <span>Add to Playlist</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className={cn(
              "bg-white dark:bg-[#282828] border border-[#E5E5E5] dark:border-[#3a3a3a] shadow-xl p-1",
              compact ? "w-40 rounded-lg" : "w-44 rounded-xl"
            )}>
              {playlists && playlists.length > 0 ? (
                <>
                  {playlists.map((playlist) => (
                    <DropdownMenuItem
                      key={playlist.id}
                      onClick={() => handleAddToPlaylist(playlist.id)}
                      className={cn(
                        "flex items-center cursor-pointer transition-colors duration-150 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]",
                        compact ? "gap-2 px-2 py-1.5 text-[11px] rounded-md" : "gap-2.5 px-2.5 py-2 text-[13px] rounded-lg"
                      )}
                    >
                      <ListPlus className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                      <span className="truncate">{playlist.title}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="my-1" />
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
                className={cn(
                  "flex items-center cursor-pointer transition-colors duration-150 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-muted-foreground",
                  compact ? "gap-2 px-2 py-1.5 text-[11px] rounded-md" : "gap-2.5 px-2.5 py-2 text-[13px] rounded-lg"
                )}
              >
                <Plus className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
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
              className="rounded-xl border-[#E5E5E5]"
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
              className="rounded-xl bg-[#FF0000] hover:brightness-90 text-white"
            >
              Create & Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
