
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BackButton } from "@/components/navigation/BackButton";
import { Music } from "lucide-react";
import { YouTubePlayer } from "@/components/music/YouTubePlayer";
import { TrackInfo } from "@/components/music/TrackInfo";

const MusicDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: track, isLoading } = useQuery({
    queryKey: ['music-track', id],
    queryFn: async () => {
      if (!id) throw new Error('No track ID provided');
      
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
    enabled: !!id,
  });

  // Update play count when track starts playing
  const handlePlayStateChange = async (isPlaying: boolean) => {
    if (isPlaying && track?.id) {
      const { error } = await supabase
        .from('music_tracks')
        .update({ plays: (track.plays || 0) + 1 })
        .eq('id', track.id);
      
      if (error) {
        console.error('Error updating play count:', error);
      }
    }
  };

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
                  <YouTubePlayer
                    audioUrl={track.audio_url}
                    thumbnail={track.thumbnail}
                    title={track.title}
                    onPlayStateChange={handlePlayStateChange}
                  />
                </div>
                <div>
                  <TrackInfo
                    title={track.title}
                    artistName={track.artist_name}
                    artistThumbnail={track.music_artists?.thumbnail_url}
                    plays={track.plays}
                    uploadedAt={track.uploaded_at}
                  />
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
