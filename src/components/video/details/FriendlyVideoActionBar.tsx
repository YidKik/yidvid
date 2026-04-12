import { ThumbsUp, Share2, Eye, Clock, Copy, Facebook, Twitter, Mail, MessageCircle, X, Heart, ListPlus, Plus, LogIn, MoreVertical, Flag, Bell } from "lucide-react";
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
    { name: "Copy Link", icon: Copy, action: handleCopyLink, color: "text-gray-600" },
    { name: "WhatsApp", icon: MessageCircle, action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, '_blank'), color: "text-green-600" },
    { name: "Facebook", icon: Facebook, action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank'), color: "text-blue-600" },
    { name: "Twitter", icon: Twitter, action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank'), color: "text-sky-500" },
    { name: "Email", icon: Mail, action: () => window.open(`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`, '_blank'), color: "text-red-500" },
  ];

  const pillBtn = compact
    ? "h-8 px-3 rounded-full text-xs font-medium transition-all duration-150 bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#1A1A1A]"
    : "h-9 px-4 rounded-full text-sm font-medium transition-all duration-150 bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#1A1A1A]";

  const iconSize = compact ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className="space-y-3">
      {/* Views & date - small meta line */}
      <div className="flex items-center gap-1.5 text-xs text-[#606060]">
        <span>{formatViewCount(views)} views</span>
        {uploadedAt && (
          <>
            <span>•</span>
            <span>{getFormattedDate(uploadedAt)}</span>
          </>
        )}
      </div>

      {/* YouTube-style combined row: Channel left, actions right */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Channel avatar + name + subscribe */}
        <div className="flex items-center gap-2.5 mr-auto min-w-0">
          {channelId ? (
            <Link to={`/channel/${channelId}`} className="flex-shrink-0">
              <Avatar className={compact ? "h-8 w-8" : "h-9 w-9"}>
                <AvatarImage src={channelThumbnail} alt={channelName} />
                <AvatarFallback className="bg-[#EF4444] text-white text-xs font-bold">
                  {channelName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className={compact ? "h-8 w-8" : "h-9 w-9"}>
              <AvatarImage src={channelThumbnail} alt={channelName} />
              <AvatarFallback className="bg-[#EF4444] text-white text-xs font-bold">
                {channelName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          <div className="min-w-0">
            {channelId ? (
              <Link 
                to={`/channel/${channelId}`}
                className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-[#1A1A1A] hover:text-[#1A1A1A] transition-colors block truncate leading-tight`}
              >
                {channelName}
              </Link>
            ) : (
              <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-[#1A1A1A] truncate block leading-tight`}>{channelName}</span>
            )}
          </div>

          {channelId && (
            <Button
              onClick={handleSubscribeClick}
              disabled={isSubLoading}
              className={`${compact ? 'h-7 px-3 text-xs' : 'h-8 px-4 text-sm'} rounded-full font-semibold transition-all ml-1 ${
                isSubscribed 
                  ? "bg-[#F2F2F2] text-[#1A1A1A] hover:bg-[#E5E5E5]" 
                  : "bg-[#1A1A1A] text-white hover:bg-[#333]"
              }`}
            >
              {isSubLoading ? (
                <span className="opacity-70">...</span>
              ) : isSubscribed ? (
                <>
                  <Bell className="w-3.5 h-3.5 mr-1 fill-current" />
                  Subscribed
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          )}
        </div>

        {/* Action buttons - right side */}
        <div className="flex items-center gap-2">
          {/* Like pill */}
          <Button
            variant="ghost"
            onClick={handleLike}
            className={cn(pillBtn, isLiked && "bg-[#1A1A1A] text-white hover:bg-[#333] hover:text-white")}
          >
            <ThumbsUp className={cn(iconSize, "mr-1.5", isLiked && "fill-current")} />
            {isLiked ? "Liked" : "Like"}
          </Button>

          {/* Share pill */}
          <Dialog open={shareOpen} onOpenChange={setShareOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className={pillBtn}>
                <Share2 className={cn(iconSize, "mr-1.5")} />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[340px] p-0 bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-xl [&>button]:hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E5E5]">
                <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Share</h3>
                <button onClick={() => setShareOpen(false)} className="text-[#999999] hover:text-[#1A1A1A] transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-1">
                {shareOptions.map((option) => (
                  <button key={option.name}
                    onClick={() => { option.action(); setShareOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5F5F5] transition-colors duration-150 group">
                    <div className="h-9 w-9 rounded-full bg-[#F5F5F5] group-hover:bg-white border border-[#E5E5E5] flex items-center justify-center flex-shrink-0">
                      <option.icon className={`h-4 w-4 ${option.color}`} />
                    </div>
                    <span className="text-sm font-medium text-[#1A1A1A]">{option.name}</span>
                  </button>
                ))}
              </div>
              <div className="px-5 pb-4">
                <button onClick={() => setShareOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF0000] hover:brightness-90 text-white text-sm font-semibold transition-all duration-200">
                  <X className="h-4 w-4" /> Close
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* 3-dot menu: Report, Favorite, Watch Later, Playlist */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className={`${compact ? 'h-8 w-8' : 'h-9 w-9'} rounded-full bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#606060]`}>
                <MoreVertical className={iconSize} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl bg-white shadow-lg border border-[#E5E5E5] p-1">
              <DropdownMenuItem onClick={handleToggleFavorite} className="rounded-lg cursor-pointer gap-3 py-2.5 px-3">
                <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
                <span className="text-sm">{isFavorite ? "Remove from Favorites" : "Add to Favorites"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleWatchLater} className="rounded-lg cursor-pointer gap-3 py-2.5 px-3">
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
                className="rounded-lg cursor-pointer gap-3 py-2.5 px-3"
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
        <DialogContent className="sm:max-w-[400px] bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add to Playlist</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2 max-h-60 overflow-y-auto">
            {playlists && playlists.length > 0 ? (
              playlists.map((playlist) => (
                <button key={playlist.id} onClick={() => handleAddToPlaylist(playlist.id)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-left">
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
              <Input placeholder="Playlist name" value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)} className="rounded-lg"
                onKeyDown={(e) => e.key === "Enter" && handleCreateAndAddToPlaylist()} />
              <Button size="icon" onClick={handleCreateAndAddToPlaylist}
                disabled={!newPlaylistName.trim()}
                className="shrink-0 rounded-lg bg-[#FF0000] hover:brightness-90">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
