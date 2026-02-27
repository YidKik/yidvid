import { ThumbsUp, ThumbsDown, Share2, Eye, Clock, Copy, Facebook, Twitter, Mail, MessageCircle, X, Heart, ListPlus, Plus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { ReportVideoDialog } from "@/components/video/ReportVideoDialog";
import { toast } from "sonner";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useVideoLibrary } from "@/hooks/useVideoLibrary";
import { cn } from "@/lib/utils";

interface FriendlyVideoActionBarProps {
  videoId: string;
  youtubeVideoId: string;
  views?: number;
  uploadedAt?: string;
  compact?: boolean;
}

type InteractionType = 'view' | 'like' | 'dislike' | 'save';

// Clean action button styles - no fades
const actionButtonBase = "h-9 px-4 rounded-full font-medium transition-all duration-200 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#666666] hover:text-[#1A1A1A]";
const actionButtonBaseCompact = "h-8 px-3 rounded-full text-sm transition-all duration-200 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#666666] hover:text-[#1A1A1A]";
const shareReportButtonBase = actionButtonBase;
const shareReportButtonCompact = actionButtonBaseCompact;

export const FriendlyVideoActionBar = ({ 
  videoId, 
  youtubeVideoId, 
  views = 0,
  uploadedAt,
  compact = false 
}: FriendlyVideoActionBarProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  
  const { isAuthenticated, user } = useUnifiedAuth();
  const userId = user?.id;

  const {
    playlists,
    isInFavorites,
    isInWatchLater,
    toggleFavorite,
    toggleWatchLater,
    createPlaylist,
    addToPlaylist,
  } = useVideoLibrary(userId);

  const isFavorite = isInFavorites(videoId);
  const isWatchLaterSaved = isInWatchLater(videoId);

  const shareUrl = `${window.location.origin}/video/${youtubeVideoId}`;
  const shareTitle = document.title;

  // Format view count
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Format date
  const getFormattedDate = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      const date = parseISO(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) {
        return formatDistanceToNow(date, { addSuffix: true });
      }
      return format(date, "MMM d, yyyy");
    } catch {
      return "";
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to like videos");
      return;
    }
    
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
    
    if (userId && !isLiked) {
      try {
        await supabase
          .from('user_video_interactions')
          .insert({
            user_id: userId,
            video_id: videoId,
            interaction_type: 'like' as InteractionType
          });
        toast.success("Added to liked videos");
      } catch (error) {
        console.error('Error saving like:', error);
      }
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to rate videos");
      return;
    }
    
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
    
    if (userId && !isDisliked) {
      try {
        await supabase
          .from('user_video_interactions')
          .insert({
            user_id: userId,
            video_id: videoId,
            interaction_type: 'dislike' as InteractionType
          });
      } catch (error) {
        console.error('Error saving dislike:', error);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
      setShareOpen(false);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        setShareOpen(false);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

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
    addToPlaylist.mutate({ playlistId, videoId });
    setPlaylistDialogOpen(false);
  };

  const handleCreateAndAddToPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    createPlaylist.mutate(
      { title: newPlaylistName.trim() },
      {
        onSuccess: (playlist) => {
          addToPlaylist.mutate({ playlistId: playlist.id, videoId });
          setPlaylistDialogOpen(false);
          setNewPlaylistName("");
        },
      }
    );
  };

  const shareOptions = [
    { 
      name: "Copy Link", 
      icon: Copy, 
      action: handleCopyLink,
      color: "text-gray-600"
    },
    { 
      name: "WhatsApp", 
      icon: MessageCircle, 
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, '_blank'),
      color: "text-green-600"
    },
    { 
      name: "Facebook", 
      icon: Facebook, 
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank'),
      color: "text-blue-600"
    },
    { 
      name: "Twitter", 
      icon: Twitter, 
      action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank'),
      color: "text-sky-500"
    },
    { 
      name: "Email", 
      icon: Mail, 
      action: () => window.open(`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`, '_blank'),
      color: "text-red-500"
    },
  ];

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Meta info */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 rounded-full">
            <Eye className="h-3.5 w-3.5" />
            <span>{formatViewCount(views)} views</span>
          </div>
          {uploadedAt && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              <span>{getFormattedDate(uploadedAt)}</span>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`${actionButtonBaseCompact} ${
              isLiked ? "bg-[#F5F5F5] text-[#FF0000]" : ""
            }`}
          >
            <ThumbsUp className={`h-4 w-4 mr-1.5 ${isLiked ? "fill-current" : ""}`} />
            Like
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDislike}
            className={`${actionButtonBaseCompact} ${
              isDisliked ? "bg-muted text-foreground" : ""
            }`}
          >
            <ThumbsDown className={`h-4 w-4 ${isDisliked ? "fill-current" : ""}`} />
          </Button>

          <Dialog open={shareOpen} onOpenChange={setShareOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={shareReportButtonCompact}
              >
                <Share2 className="h-4 w-4 mr-1.5" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[360px] bg-white dark:bg-gray-900 border-border shadow-2xl [&>button]:hidden">
              <button 
                onClick={() => setShareOpen(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-yellow-500" />
                  Share this video
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-4">
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => { option.action(); setShareOpen(false); }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 hover:bg-yellow-50 hover:border-yellow-300 border border-transparent transition-all duration-200 hover:shadow-md"
                  >
                    <option.icon className={`h-6 w-6 ${option.color}`} />
                    <span className="text-xs font-medium text-muted-foreground">{option.name}</span>
                  </button>
                ))}
              </div>
              {navigator.share && (
                <button
                  onClick={handleShareNative}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium transition-all duration-200"
                >
                  <Share2 className="h-4 w-4" />
                  More sharing options...
                </button>
              )}
            </DialogContent>
          </Dialog>

          <ReportVideoDialog videoId={videoId} compact />

          {/* Favorites Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            className={`${actionButtonBaseCompact} ${isFavorite ? "bg-red-50 text-red-500" : ""}`}
          >
            <Heart className={cn("h-4 w-4 mr-1.5", isFavorite && "fill-current")} />
            {isFavorite ? "Saved" : "Favorite"}
          </Button>

          {/* Watch Later Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleWatchLater}
            className={`${actionButtonBaseCompact} ${isWatchLaterSaved ? "bg-blue-50 text-blue-500" : ""}`}
          >
            <Clock className={cn("h-4 w-4 mr-1.5", isWatchLaterSaved && "fill-current")} />
            {isWatchLaterSaved ? "Saved" : "Watch Later"}
          </Button>

          {/* Add to Playlist Button */}
          <Dialog open={playlistDialogOpen} onOpenChange={setPlaylistDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={actionButtonBaseCompact}
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.info("Please sign in to use playlists", { icon: <LogIn className="w-4 h-4" /> });
                    return;
                  }
                }}
              >
                <ListPlus className="h-4 w-4 mr-1.5" />
                Playlist
              </Button>
            </DialogTrigger>
            {isAuthenticated && (
              <DialogContent className="sm:max-w-[360px] bg-white rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">Add to Playlist</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-2 max-h-60 overflow-y-auto">
                  {playlists && playlists.length > 0 ? (
                    playlists.map((playlist) => (
                      <button
                        key={playlist.id}
                        onClick={() => handleAddToPlaylist(playlist.id)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-left"
                      >
                        <ListPlus className="w-4 h-4 text-gray-500" />
                        <span className="truncate">{playlist.title}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">No playlists yet</p>
                  )}
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Create new playlist</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Playlist name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="rounded-lg"
                      onKeyDown={(e) => e.key === "Enter" && handleCreateAndAddToPlaylist()}
                    />
                    <Button
                      size="icon"
                      onClick={handleCreateAndAddToPlaylist}
                      disabled={!newPlaylistName.trim()}
                      className="shrink-0 rounded-lg bg-red-500 hover:bg-red-600"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Meta info row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
          <Eye className="h-4 w-4" />
          <span className="font-medium">{formatViewCount(views)} views</span>
        </div>
        {uploadedAt && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{getFormattedDate(uploadedAt)}</span>
          </div>
        )}
      </div>
      
      {/* Action buttons row - subtle styling */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Like Button */}
        <Button
          variant="ghost"
          onClick={handleLike}
          className={`${actionButtonBase} ${
            isLiked ? "bg-red-50 text-red-500" : ""
          }`}
        >
          <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
          {isLiked ? "Liked" : "Like"}
        </Button>

        {/* Dislike Button */}
        <Button
          variant="ghost"
          onClick={handleDislike}
          className={`${actionButtonBase} px-3 ${
            isDisliked ? "bg-muted text-foreground" : ""
          }`}
        >
          <ThumbsDown className={`h-4 w-4 ${isDisliked ? "fill-current" : ""}`} />
        </Button>

        {/* Share Button with Dialog Popup */}
        <Dialog open={shareOpen} onOpenChange={setShareOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className={shareReportButtonBase}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] bg-white dark:bg-gray-900 border-border shadow-2xl [&>button]:hidden">
            <button 
              onClick={() => setShareOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                <Share2 className="h-5 w-5 text-yellow-500" />
                Share this video
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => { option.action(); setShareOpen(false); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 hover:bg-yellow-50 hover:border-yellow-300 border border-transparent transition-all duration-200 hover:shadow-md"
                >
                  <option.icon className={`h-6 w-6 ${option.color}`} />
                  <span className="text-sm font-medium text-muted-foreground">{option.name}</span>
                </button>
              ))}
            </div>
            {navigator.share && (
              <button
                onClick={handleShareNative}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium transition-all duration-200"
              >
                <Share2 className="h-4 w-4" />
                More sharing options...
              </button>
            )}
          </DialogContent>
        </Dialog>

        {/* Report Button */}
        <ReportVideoDialog videoId={videoId} />

        {/* Favorites Button */}
        <Button
          variant="ghost"
          onClick={handleToggleFavorite}
          className={`${actionButtonBase} ${isFavorite ? "bg-red-50 text-red-500" : ""}`}
        >
          <Heart className={cn("h-4 w-4 mr-2", isFavorite && "fill-current")} />
          {isFavorite ? "Saved" : "Favorite"}
        </Button>

        {/* Watch Later Button */}
        <Button
          variant="ghost"
          onClick={handleToggleWatchLater}
          className={`${actionButtonBase} ${isWatchLaterSaved ? "bg-blue-50 text-blue-500" : ""}`}
        >
          <Clock className={cn("h-4 w-4 mr-2", isWatchLaterSaved && "fill-current")} />
          {isWatchLaterSaved ? "Saved" : "Later"}
        </Button>

        {/* Add to Playlist Button */}
        <Dialog open={playlistDialogOpen} onOpenChange={setPlaylistDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className={actionButtonBase}
              onClick={() => {
                if (!isAuthenticated) {
                  toast.info("Please sign in to use playlists", { icon: <LogIn className="w-4 h-4" /> });
                  return;
                }
              }}
            >
              <ListPlus className="h-4 w-4 mr-2" />
              Playlist
            </Button>
          </DialogTrigger>
          {isAuthenticated && (
            <DialogContent className="sm:max-w-[400px] bg-white rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Add to Playlist</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-2 max-h-60 overflow-y-auto">
                {playlists && playlists.length > 0 ? (
                  playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => handleAddToPlaylist(playlist.id)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <ListPlus className="w-4 h-4 text-gray-500" />
                      <span className="truncate">{playlist.title}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">No playlists yet</p>
                )}
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Create new playlist</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Playlist name"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="rounded-lg"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateAndAddToPlaylist()}
                  />
                  <Button
                    size="icon"
                    onClick={handleCreateAndAddToPlaylist}
                    disabled={!newPlaylistName.trim()}
                    className="shrink-0 rounded-lg bg-red-500 hover:bg-red-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  );
};