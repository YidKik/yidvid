
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VideoCard } from "@/components/VideoCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Youtube, Search as SearchIcon, Users, Play, Eye } from "lucide-react";
import { usePageLoader } from "@/contexts/LoadingContext";
import { useState, useEffect, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";

const TypingSearchLoader = ({ query }: { query: string }) => {
  const prefix = 'Searching results for ';
  const fullText = prefix + query;
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => { setCharIndex(0); }, [query]);

  useEffect(() => {
    if (charIndex < fullText.length) {
      const timer = setTimeout(() => setCharIndex(charIndex + 1), 40);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setCharIndex(0), 1500);
      return () => clearTimeout(timer);
    }
  }, [charIndex, fullText]);

  const prefixEnd = Math.min(charIndex, prefix.length);
  const queryStart = Math.max(0, charIndex - prefix.length);
  const displayedPrefix = prefix.slice(0, prefixEnd);
  const displayedQuery = query.slice(0, queryStart);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-[#FFCC00]/30 border-t-[#FF0000] animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-[#1A1A1A] min-h-[32px]">
          <span>{displayedPrefix}</span>
          {displayedQuery && <span className="text-[#FF0000]">"{displayedQuery}"</span>}
          <span className="inline-block w-[3px] h-6 bg-[#FFCC00] ml-1 animate-pulse align-text-bottom rounded-sm" />
        </p>
        <p className="text-sm font-medium text-[#999999] mt-3">Finding the best matches...</p>
      </div>
    </div>
  );
};

const formatViews = (views: number) => {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K`;
  return views.toString();
};

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { isMobile, isTablet } = useIsMobile();
  const { filterVideos, filterChannels } = useHiddenChannels();
  const navigate = useNavigate();

  const { data: allResults, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["search-videos", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .filter('deleted_at', 'is', null)
        .or(`title.ilike.%${query}%,channel_name.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    },
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ["search-channels", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .filter('deleted_at', 'is', null)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    },
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const filteredAll = useMemo(() => filterVideos(allResults || []), [allResults, filterVideos]);
  const filteredVideos = useMemo(() => filteredAll.filter((v: any) => !v.is_short), [filteredAll]);
  const filteredShorts = useMemo(() => filteredAll.filter((v: any) => v.is_short), [filteredAll]);
  const filteredChannels = useMemo(() => filterChannels(channels || []), [channels, filterChannels]);

  const isLoading = isLoadingVideos || isLoadingChannels;
  usePageLoader('search', isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-16 pl-0 lg:pl-[200px] pb-20 lg:pb-0 transition-all duration-300">
        <main className="max-w-7xl mx-auto px-6 py-8">
          <TypingSearchLoader query={query} />
        </main>
      </div>
    );
  }

  const totalResults = filteredChannels.length + filteredVideos.length + filteredShorts.length;

  return (
    <div className="min-h-screen bg-white pt-16 pl-0 lg:pl-[200px] pb-20 lg:pb-0 transition-all duration-300">
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {/* Search Header */}
        <div className={isMobile ? "mb-5" : "mb-8"}>
          <div className="flex items-center gap-2 mb-2">
            <SearchIcon className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-[#999999]`} />
            <h1 className={`${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'} font-bold text-[#1A1A1A]`}>
              Search results for "<span className="text-[#FF0000]">{query}</span>"
            </h1>
          </div>
          <p className="text-sm text-[#999999] ml-9">
            {totalResults} results found
          </p>
        </div>

        {/* Channels Section */}
        {filteredChannels.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E5E5]">
              <Users className="h-5 w-5 text-[#FF0000]" />
              <h2 className="text-lg font-bold text-[#1A1A1A]">Channels</h2>
              <span className="bg-[#FF0000] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {filteredChannels.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredChannels.map((channel: any) => (
                <Link
                  key={channel.id}
                  to={`/channel/${channel.channel_id}`}
                  className={`group flex items-center gap-3 ${isMobile ? 'p-3' : 'p-4'} rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] hover:border-[#FFCC00] hover:shadow-md transition-all duration-200`}
                >
                  <Avatar className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} flex-shrink-0 border-2 border-[#E5E5E5] group-hover:border-[#FFCC00] transition-colors`}>
                    <AvatarImage src={channel.thumbnail_url} alt={channel.title} />
                    <AvatarFallback className="bg-[#F5F5F5]">
                      <Youtube className="w-7 h-7 text-[#FF0000]" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1A1A1A] text-sm line-clamp-1 group-hover:text-[#FF0000] transition-colors">
                      {channel.title}
                    </h3>
                    {channel.description && (
                      <p className="text-xs text-[#999999] mt-1 line-clamp-2">{channel.description}</p>
                    )}
                    <span className="inline-block mt-2 text-xs font-medium text-[#FF0000] bg-[#FF0000]/10 px-2 py-0.5 rounded-full">
                      View Channel
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {filteredChannels.length === 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E5E5]">
              <Users className="h-5 w-5 text-[#FF0000]" />
              <h2 className="text-lg font-bold text-[#1A1A1A]">Channels</h2>
              <span className="bg-[#E5E5E5] text-[#999999] text-xs font-bold px-2.5 py-0.5 rounded-full">0</span>
            </div>
            <div className="text-center py-8 bg-[#FAFAFA] rounded-xl border border-[#E5E5E5]">
              <p className="text-sm text-[#999999]">No channels found matching "{query}"</p>
            </div>
          </section>
        )}

        {/* Shorts Section */}
        {filteredShorts.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E5E5]">
              <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                <Play className="h-3 w-3 text-white fill-white" />
              </div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">Shorts</h2>
              <span className="bg-[#FF0000] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {filteredShorts.length}
              </span>
            </div>
            <div className={`grid ${isMobile ? 'grid-cols-3 gap-2' : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3'}`}>
              {filteredShorts.map((short: any) => (
                <div
                  key={short.id}
                  className="cursor-pointer group"
                  onClick={() => navigate(`/shorts/${short.video_id}`)}
                >
                  <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '9/16' }}>
                    <img
                      src={short.thumbnail}
                      alt={short.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
                    {/* Short badge */}
                    <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      SHORT
                    </span>
                    {short.views > 0 && (
                      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5 text-white/80" />
                        <span className="text-[9px] text-white/80 font-medium">{formatViews(short.views)}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                  <p className={`mt-1.5 ${isMobile ? 'text-[10px]' : 'text-[11px]'} font-medium text-[#1A1A1A] line-clamp-2 leading-tight`}>
                    {short.title}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Videos Section */}
        <section>
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E5E5]">
            <Play className="h-5 w-5 text-[#FF0000]" />
            <h2 className="text-lg font-bold text-[#1A1A1A]">Videos</h2>
            <span className="bg-[#FF0000] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filteredVideos.length}
            </span>
          </div>

          {filteredVideos.length === 0 ? (
            <div className="text-center py-8 bg-[#FAFAFA] rounded-xl border border-[#E5E5E5]">
              <p className="text-sm text-[#999999]">No videos found matching "{query}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredVideos.map((video: any) => (
                <VideoCard
                  key={video.id}
                  id={video.video_id}
                  uuid={video.id}
                  title={video.title}
                  thumbnail={video.thumbnail}
                  channelName={video.channel_name}
                  channelId={video.channel_id}
                  views={video.views}
                  uploadedAt={video.uploaded_at}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Search;
