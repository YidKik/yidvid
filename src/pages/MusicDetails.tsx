import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BackButton } from "@/components/navigation/BackButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Music, Play, Pause } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const MusicDetails = () => {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data: track, isLoading } = useQuery({
    queryKey: ['music-track', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('music_tracks')
        .select(`
          *,
          music_artists (
            artist_id,
            thumbnail_url,
            title
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching track:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Track not found');
      }
      
      return data;
    },
  });

  const handlePlay = () => {
    if (!track?.audio_url) {
      toast.error("No audio file available for this track");
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          toast.error("Error playing audio");
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Update play count when track starts playing
  useEffect(() => {
    if (isPlaying && track?.id) {
      const updatePlays = async () => {
        const { error } = await supabase
          .from('music_tracks')
          .update({ plays: (track.plays || 0) + 1 })
          .eq('id', track.id);
        
        if (error) {
          console.error('Error updating play count:', error);
        }
      };
      
      updatePlays();
    }
  }, [isPlaying, track?.id, track?.plays]);

  if (isLoading) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full">
          <Sidebar />
          <div className="flex-1">
            <Header />
            <main className="mt-16 p-6">
              <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading track...</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!track) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full">
          <Sidebar />
          <div className="flex-1">
            <Header />
            <main className="mt-16 p-6">
              <BackButton />
              <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                  <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Track Not Found</h2>
                  <p className="text-gray-500 mb-4">The track you're looking for doesn't exist or has been removed.</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="mt-16 p-6">
            <div className="max-w-7xl mx-auto">
              <BackButton />
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black relative">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-4 flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <Button
                      onClick={handlePlay}
                      size="icon"
                      className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <h2 className="font-semibold text-lg">{track.title}</h2>
                      <p className="text-sm text-gray-500">{track.artist_name}</p>
                    </div>
                    {track.audio_url && (
                      <audio
                        ref={audioRef}
                        src={track.audio_url}
                        onEnded={handleAudioEnded}
                        className="hidden"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{track.title}</h1>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={track.music_artists?.thumbnail_url} />
                        <AvatarFallback>
                          <Music className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="font-semibold">{track.artist_name}</h2>
                        <p className="text-sm text-gray-500">
                          {track.plays} plays
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Uploaded {formatDistanceToNow(new Date(track.uploaded_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MusicDetails;