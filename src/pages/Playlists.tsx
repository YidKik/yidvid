import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ListMusic, Plus, Play, Pencil, Trash2, LogIn, ArrowLeft, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { useVideoLibrary, usePlaylistItems } from "@/hooks/useVideoLibrary";
import { useSessionManager } from "@/hooks/useSessionManager";
import { VideoOptionsMenu } from "@/components/video/VideoOptionsMenu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/layout/Footer";
import { useIsMobile } from "@/hooks/use-mobile";

const Playlists = () => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPlaylistId = searchParams.get("id");
  
  const { isAuthenticated, session, setIsAuthOpen } = useSessionManager();
  const userId = session?.user?.id;
  const { playlists, isLoading, createPlaylist, updatePlaylist, deletePlaylist, removeFromPlaylist } = useVideoLibrary(userId);
  const { data: playlistItems, isLoading: isLoadingItems } = usePlaylistItems(selectedPlaylistId || undefined);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<{ id: string; title: string; description?: string } | null>(null);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");

  const selectedPlaylist = playlists?.find((p) => p.id === selectedPlaylistId);

  const handleCreatePlaylist = () => {
    if (!newPlaylistTitle.trim()) return;
    createPlaylist.mutate(
      { title: newPlaylistTitle.trim(), description: newPlaylistDescription.trim() || undefined },
      {
        onSuccess: () => {
          setShowCreateDialog(false);
          setNewPlaylistTitle("");
          setNewPlaylistDescription("");
        },
      }
    );
  };

  const handleUpdatePlaylist = () => {
    if (!editingPlaylist || !editingPlaylist.title.trim()) return;
    updatePlaylist.mutate(
      { id: editingPlaylist.id, title: editingPlaylist.title.trim(), description: editingPlaylist.description },
      {
        onSuccess: () => {
          setShowEditDialog(false);
          setEditingPlaylist(null);
        },
      }
    );
  };

  const handleDeletePlaylist = (playlistId: string) => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      deletePlaylist.mutate(playlistId, {
        onSuccess: () => {
          if (selectedPlaylistId === playlistId) {
            setSearchParams({});
          }
        },
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-14 pl-0 lg:pl-[200px] bg-white flex flex-col pb-20 lg:pb-0">
        <div className="flex-1 max-w-6xl mx-auto px-4 lg:px-6 py-12">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-yellow-100 to-red-100 flex items-center justify-center mb-6 shadow-sm">
              <ListMusic className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 font-friendly">Sign in to view your playlists</h1>
            <p className="text-gray-500 mb-6 max-w-md">
              Create custom playlists to organize your favorite videos. Sign in to get started.
            </p>
            <Button
              onClick={() => setIsAuthOpen(true)}
              className="rounded-full gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-3 font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Playlist detail view
  if (selectedPlaylistId && selectedPlaylist) {
    return (
      <div className="min-h-screen pt-14 pl-0 lg:pl-[200px] bg-white flex flex-col pb-20 lg:pb-0">
        <div className="flex-1 max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
          {/* Back button */}
          <button
            onClick={() => setSearchParams({})}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Playlists</span>
          </button>

          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-2xl bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center shadow-lg`}>
                <ListMusic className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
              </div>
              <div>
                <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 font-friendly`}>{selectedPlaylist.title}</h1>
                {selectedPlaylist.description && (
                  <p className="text-gray-500 text-sm mt-1">{selectedPlaylist.description}</p>
                )}
                <p className="text-gray-400 text-sm mt-1">
                  {playlistItems?.length || 0} video{(playlistItems?.length || 0) !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border border-gray-200 rounded-xl shadow-lg">
                <DropdownMenuItem
                  onClick={() => {
                    setEditingPlaylist({
                      id: selectedPlaylist.id,
                      title: selectedPlaylist.title,
                      description: selectedPlaylist.description || "",
                    });
                    setShowEditDialog(true);
                  }}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                >
                  <Pencil className="w-4 h-4" />
                  Edit playlist
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                  className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete playlist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Playlist items */}
          {isLoadingItems ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-44 aspect-video bg-gray-100 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !playlistItems || playlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-100 to-red-100 flex items-center justify-center mb-4">
                <ListMusic className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 font-friendly">No videos in this playlist</h2>
              <p className="text-gray-500">Add videos from any video page using the menu.</p>
              <Button
                onClick={() => navigate('/videos')}
                className="mt-6 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 shadow-md hover:shadow-lg transition-all"
              >
                Browse Videos
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {playlistItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`${isMobile ? 'flex-col' : 'flex'} gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-all group cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-sm`}
                  onClick={() => navigate(`/video/${item.video?.video_id}?playlist=${selectedPlaylistId}`)}
                >
                  <div className={`relative ${isMobile ? 'w-full' : 'w-44'} aspect-video rounded-xl overflow-hidden bg-gray-100 shrink-0 shadow-sm`}>
                    <img
                      src={item.video?.thumbnail}
                      alt={item.video?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center shadow-md">
                        <Play className="w-5 h-5 text-gray-900 fill-gray-900 ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-red-500 transition-colors">
                      {item.video?.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1.5">{item.video?.channel_name}</p>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => removeFromPlaylist.mutate({ playlistId: selectedPlaylistId, videoId: item.video?.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <Footer />

        {/* Edit Playlist Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md bg-white rounded-2xl border-0 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-friendly">Edit Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Playlist name"
                value={editingPlaylist?.title || ""}
                onChange={(e) => setEditingPlaylist((prev) => prev ? { ...prev, title: e.target.value } : null)}
                className="rounded-xl border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
              />
              <Textarea
                placeholder="Description (optional)"
                value={editingPlaylist?.description || ""}
                onChange={(e) => setEditingPlaylist((prev) => prev ? { ...prev, description: e.target.value } : null)}
                className="rounded-xl border-gray-200 focus:border-yellow-400 focus:ring-yellow-400 resize-none"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowEditDialog(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePlaylist}
                disabled={!editingPlaylist?.title.trim() || updatePlaylist.isPending}
                className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Playlists list view
  return (
    <div className="min-h-screen pt-14 pl-0 lg:pl-[200px] bg-white flex flex-col pb-20 lg:pb-0">
      <div className="flex-1 max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center shadow-lg">
              <ListMusic className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-friendly">Playlists</h1>
              <p className="text-gray-500 mt-1">{playlists?.length || 0} playlist{(playlists?.length || 0) !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="rounded-full gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            New Playlist
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-100 rounded-2xl mb-3" />
                <div className="h-4 bg-gray-100 rounded-full w-3/4" />
              </div>
            ))}
          </div>
        ) : !playlists || playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-100 to-red-100 flex items-center justify-center mb-6 shadow-sm">
              <ListMusic className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 font-friendly">No playlists yet</h2>
            <p className="text-gray-500 max-w-md mb-6">
              Create your first playlist to organize your favorite videos.
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="rounded-full gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Playlist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group cursor-pointer bg-white rounded-2xl p-5 hover:shadow-lg transition-all border border-gray-100 hover:border-gray-200"
                onClick={() => setSearchParams({ id: playlist.id })}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100 mb-4 flex items-center justify-center shadow-sm">
                  <ListMusic className="w-14 h-14 text-red-400" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-gray-900 fill-gray-900 ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-red-500 transition-colors">
                      {playlist.title}
                    </h3>
                    {playlist.description && (
                      <p className="text-xs text-gray-500 truncate mt-1">{playlist.description}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full shrink-0 hover:bg-gray-100">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border border-gray-200 rounded-xl shadow-lg">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPlaylist({
                            id: playlist.id,
                            title: playlist.title,
                            description: playlist.description || "",
                          });
                          setShowEditDialog(true);
                        }}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlaylist(playlist.id);
                        }}
                        className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />

      {/* Create Playlist Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-friendly">Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Playlist name"
              value={newPlaylistTitle}
              onChange={(e) => setNewPlaylistTitle(e.target.value)}
              className="rounded-xl border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
            />
            <Textarea
              placeholder="Description (optional)"
              value={newPlaylistDescription}
              onChange={(e) => setNewPlaylistDescription(e.target.value)}
              className="rounded-xl border-gray-200 focus:border-yellow-400 focus:ring-yellow-400 resize-none"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlaylist}
              disabled={!newPlaylistTitle.trim() || createPlaylist.isPending}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Playlist Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-friendly">Edit Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Playlist name"
              value={editingPlaylist?.title || ""}
              onChange={(e) => setEditingPlaylist((prev) => prev ? { ...prev, title: e.target.value } : null)}
              className="rounded-xl border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
            />
            <Textarea
              placeholder="Description (optional)"
              value={editingPlaylist?.description || ""}
              onChange={(e) => setEditingPlaylist((prev) => prev ? { ...prev, description: e.target.value } : null)}
              className="rounded-xl border-gray-200 focus:border-yellow-400 focus:ring-yellow-400 resize-none"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEditDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePlaylist}
              disabled={!editingPlaylist?.title.trim() || updatePlaylist.isPending}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Playlists;
