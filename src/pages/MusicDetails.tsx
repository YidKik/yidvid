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
import { useState, useRef } from "react";
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
        .single();

      if (error) throw error;
      return data;
    },
  });

  const formatPlays = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

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

  if (isLoading) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full">
          <Sidebar />
          <div className="flex-1">
            <Header />
            <main className="mt-16 p-6">
              <div>Loading...</div>
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
              <div>Track not found</div>
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
                      disabled={!track.audio_url}
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
                          {formatPlays(track.plays)} plays
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