import { ThumbsUp, Share2, Clock, Copy, Facebook, Twitter, Mail, MessageCircle, X, Heart, ListPlus, Plus, LogIn, MoreVertical, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { toast } from "sonner";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useVideoLibrary } from "@/hooks/useVideoLibrary";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useEnhancedChannelSubscription } from "@/hooks/channel/useEnhancedChannelSubscription";
import { ReportVideoDialog } from "@/components/video/ReportVideoDialog";

interface FriendlyVideoActionBarProps {
  videoId: string;
  youtubeVideoId: string;
  views?: number;
  uploadedAt?: string;
  compact?: boolean;
  // Channel info props
  channelName?: string;
  channelId?: string;
  channelThumbnail?: string;
}

type InteractionType = 'view' | 'like' | 'dislike' | 'save';

export const FriendlyVideoActionBar = ({ 
  videoId, 
  youtubeVideoId, 
  views = 0,
  uploadedAt,
  compact = false,
  channelName = "",
  channelId = "",
  channelThumbnail = "",
}: FriendlyVideoActionBarProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  
  const { isAuthenticated, user, isLoading: authLoading, isProfileLoading } = useUnifiedAuth();
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

  const { 
    isSubscribed, 
    handleSubscribe, 
    isLoading: subscriptionLoading,
    isUserDataReady
  } = useEnhancedChannelSubscription(channelId);

  const isFavorite = isInFavorites(videoId);
  const isWatchLaterSaved = isInWatchLater(videoId);
  const shareUrl = `${window.location.origin}/video/${youtubeVideoId}`;
  const shareTitle = document.title;

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getFormattedDate = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      const date = parseISO(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) return formatDistanceToNow(date, { addSuffix: true });
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
    if (userId && !isLiked) {
      try {
        await supabase.from('user_video_interactions').insert({
          user_id: userId, video_id: videoId, interaction_type: 'like' as InteractionType
        });
      } catch (error) {
        console.error('Error saving like:', error);
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

  const handleSubscribeClick = async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to subscribe to channels");
      return;
    }
    if (!isUserDataReady) {
      toast.info("Please wait while we load your profile...");
      return;
    }
    await handleSubscribe();
  };

  const isSubLoading = authLoading || isProfileLoading || subscriptionLoading;

  const shareOptions = [
    { name: "Copy Link", icon: Copy, action: handleCopyLink, color: "text-muted-foreground" },
    { name: "WhatsApp", icon: MessageCircle, action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, '_blank'), color: "text-green-600" },
    { name: "Facebook", icon: Facebook, action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank'), color: "text-blue-600" },
    { name: "Twitter", icon: Twitter, action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank'), color: "text-sky-500" },
    { name: "Email", icon: Mail, action: () => window.open(`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`, '_blank'), color: "text-brand" },
  ];

  const pillBtn = compact
    ? "touch-target h-11 px-4 rounded-control text-sm leading-5 font-medium transition-all duration-150 bg-muted dark:bg-secondary hover:bg-surface-active dark:hover:bg-secondary text-foreground dark:text-foreground"
    : "touch-target h-9 px-4 rounded-control text-sm font-medium transition-all duration-150 bg-muted dark:bg-secondary hover:bg-surface-active dark:hover:bg-secondary text-foreground dark:text-foreground";

  const iconSize = "h-4 w-4";

  return (
    <div className="space-y-3">
      {/* Views & date - small meta line */}
      <div className={`flex items-center gap-2 ${compact ? 'text-[13px] leading-5' : 'text-xs'} text-muted-foreground dark:text-muted-foreground`}>
        <span>{formatViewCount(views)} views</span>
        {uploadedAt && (
          <>
            <span>•</span>
            <span>{getFormattedDate(uploadedAt)}</span>
          </>
        )}
      </div>

      {/* YouTube-style combined row: Channel left, actions right */}
      <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'} flex-wrap`}>
        {/* Channel avatar + name + subscribe */}
        <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'} mr-auto min-w-0`}>
          {channelId ? (
            <Link to={`/channel/${channelId}`} className="flex-shrink-0">
              <Avatar className={compact ? "h-6 w-6" : "h-9 w-9"}>
                <AvatarImage src={channelThumbnail} alt={channelName} />
                <AvatarFallback className={`bg-primary text-white ${compact ? 'text-xs' : 'text-xs'} font-bold`}>
                  {channelName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className={compact ? "h-6 w-6" : "h-9 w-9"}>
              <AvatarImage src={channelThumbnail} alt={channelName} />
              <AvatarFallback className={`bg-primary text-white ${compact ? 'text-xs' : 'text-xs'} font-bold`}>
                {channelName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          <div className="min-w-0">
            {channelId ? (
              <Link 
                to={`/channel/${channelId}`}
                className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-foreground dark:text-foreground hover:text-foreground dark:hover:text-white transition-colors block truncate leading-tight`}
              >
                {channelName}
              </Link>
            ) : (
              <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-foreground dark:text-foreground truncate block leading-tight`}>{channelName}</span>
            )}
          </div>

          {channelId && (
            <Button
              variant="ghost"
              onClick={handleSubscribeClick}
              disabled={isSubLoading}
              data-subscribed={isSubscribed ? "true" : "false"}
              className={`${compact ? 'h-11 px-4 text-sm leading-5' : 'h-9 px-4 text-sm'} video-subscribe-button touch-target rounded-control font-semibold transition-all ml-0.5`}
            >
              {isSubLoading ? (
                <span className="opacity-70">...</span>
              ) : isSubscribed ? (
                <>
                  <Bell className={`${compact ? 'w-2.5 h-2.5 mr-0.5' : 'w-3.5 h-3.5 mr-1'} fill-current`} />
                  Subscribed
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          )}
        </div>

        {/* Action buttons - right side */}
        <div className={`flex items-center ${compact ? 'gap-2' : 'gap-2'}`}>
          {/* Like pill */}
          <Button
            variant="ghost"
            onClick={handleLike}
            className={cn(pillBtn, isLiked && "bg-[#1A1A1A] text-white hover:bg-[#333] hover:text-white")}
          >
            <ThumbsUp className={cn(iconSize, "mr-2", isLiked && "fill-current")} />
            {isLiked ? "Liked" : "Like"}
          </Button>

          {/* Share pill */}
          <Dialog open={shareOpen} onOpenChange={setShareOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className={pillBtn}>
                <Share2 className={cn(iconSize, "mr-2")} />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent className="mobile-share-dialog sm:max-w-[340px] max-[768px]:max-w-[calc(100%-2rem)] max-[768px]:max-h-[70vh] p-0 bg-card border border-border rounded-dialog overflow-hidden shadow-overlay [&>button]:hidden">
              <div className="flex items-center justify-between pl-4 pr-2 py-1 max-[768px]:pl-4 border-b border-border">
                <h3 className="text-sm font-bold text-foreground">Share</h3>
                <button type="button" onClick={() => setShareOpen(false)} aria-label="Close share dialog" className="w-11 h-11 rounded-control flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-4 py-4 space-y-1">
                {shareOptions.map((option) => (
                  <button key={option.name}
                    onClick={() => { option.action(); setShareOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-control hover:bg-surface-hover transition-colors duration-150 group">
                    <div className="h-9 w-9 rounded-control bg-muted group-hover:bg-white border border-border flex items-center justify-center flex-shrink-0">
                      <option.icon className={`h-4 w-4 ${option.color}`} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{option.name}</span>
                  </button>
                ))}
              </div>
              <div className="px-4 pb-4">
                <button onClick={() => setShareOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-control bg-primary hover:brightness-90 text-white text-sm font-semibold transition-all duration-200">
                  <X className="h-4 w-4" /> Close
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* 3-dot menu: Report, Favorite, Watch Later, Playlist */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className={`touch-target ${compact ? 'h-11 w-11' : 'h-9 w-9'} rounded-control bg-muted dark:bg-secondary hover:bg-surface-active dark:hover:bg-secondary text-muted-foreground dark:text-muted-foreground`}>
                <MoreVertical className={iconSize} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-card bg-white shadow-raised border border-border p-1">
              <DropdownMenuItem onClick={handleToggleFavorite} className="rounded-control cursor-pointer gap-3 py-3 px-3">
                <Heart className={cn("h-4 w-4", isFavorite && "fill-brand text-brand")} />
                <span className="text-sm">{isFavorite ? "Remove from Favorites" : "Add to Favorites"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleWatchLater} className="rounded-control cursor-pointer gap-3 py-3 px-3">
                <Clock className={cn("h-4 w-4", isWatchLaterSaved && "fill-current")} />
                <span className="text-sm">{isWatchLaterSaved ? "Remove from Watch Later" : "Watch Later"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.info("Please sign in to use playlists", { icon: <LogIn className="w-4 h-4" /> });
                    return;
                  }
                  setPlaylistDialogOpen(true);
                }} 
                className="rounded-control cursor-pointer gap-3 py-3 px-3"
              >
                <ListPlus className="h-4 w-4" />
                <span className="text-sm">Add to Playlist</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Report - rendered inline, manages its own dialog */}
          <ReportVideoDialog videoId={videoId} compact />
        </div>
      </div>

      {/* Playlist Dialog */}
      <Dialog open={playlistDialogOpen} onOpenChange={setPlaylistDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white rounded-dialog">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add to Playlist</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2 max-h-60 overflow-y-auto">
            {playlists && playlists.length > 0 ? (
              playlists.map((playlist) => (
                <button key={playlist.id} onClick={() => handleAddToPlaylist(playlist.id)}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-control hover:bg-gray-100 transition-colors text-left">
                  <ListPlus className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{playlist.title}</span>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">No playlists yet</p>
            )}
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Create new playlist</p>
            <div className="flex gap-2">
              <Input placeholder="Playlist name" value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)} className="rounded-control"
                onKeyDown={(e) => e.key === "Enter" && handleCreateAndAddToPlaylist()} />
              <Button size="icon" onClick={handleCreateAndAddToPlaylist}
                disabled={!newPlaylistName.trim()}
                className="shrink-0 rounded-control bg-primary hover:brightness-90">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
