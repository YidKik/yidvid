
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Youtube, Search as SearchIcon, Users, Play, Eye } from "lucide-react";
import { usePageLoader } from "@/contexts/LoadingContext";
import { useState, useEffect, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";
import { formatDistanceToNow, parseISO } from "date-fns";

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
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K views`;
  return `${views} views`;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return "";
  }
};

// Fetch channel thumbnails for video results
const useChannelThumbnails = (channelIds: string[]) => {
  return useQuery({
    queryKey: ["channel-thumbnails", channelIds.join(",")],
    queryFn: async () => {
      if (channelIds.length === 0) return {};
      const { data } = await supabase
        .from("youtube_channels")
        .select("channel_id, thumbnail_url")
        .in("channel_id", channelIds);
      const map: Record<string, string> = {};
      data?.forEach((ch) => { if (ch.thumbnail_url) map[ch.channel_id] = ch.thumbnail_url; });
      return map;
    },
    enabled: channelIds.length > 0,
    staleTime: 1000 * 60 * 30,
  });
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

  // Get unique channel IDs from videos for thumbnails
  const channelIds = useMemo(() => {
    const ids = new Set(filteredVideos.map((v: any) => v.channel_id));
    return Array.from(ids);
  }, [filteredVideos]);
  const { data: channelThumbnails = {} } = useChannelThumbnails(channelIds);

  const isLoading = isLoadingVideos || isLoadingChannels;
  usePageLoader('search', isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-16 pl-0 lg:pl-[200px] pb-20 lg:pb-0 transition-all duration-300">
        <main className="max-w-5xl mx-auto px-4 lg:px-6 py-8">
          <TypingSearchLoader query={query} />
        </main>
      </div>
    );
  }

  const totalResults = filteredChannels.length + filteredVideos.length + filteredShorts.length;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-16 pl-0 lg:pl-[200px] pb-20 lg:pb-0 transition-all duration-300">
      <main className="max-w-5xl mx-auto px-4 lg:px-6 py-5 lg:py-8">
        {/* Search Header - clean and minimal */}
        <div className="mb-6">
          <h1 className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-[#1A1A1A] dark:text-[#e8e8e8]`}>
            Results for "<span className="text-[#FF0000]">{query}</span>"
          </h1>
          <p className={`${isMobile ? 'text-[11px]' : 'text-xs'} text-[#999999] mt-1`}>
            {totalResults} result{totalResults !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Channels Section - compact pill cards */}
        {filteredChannels.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Users className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-[#999999]`} />
              <h2 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-[#606060] dark:text-[#aaa] uppercase tracking-wide`}>Channels</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {filteredChannels.map((channel: any) => (
                <Link
                  key={channel.id}
                  to={`/channel/${channel.channel_id}`}
                  className="group flex items-center gap-2.5 px-3 py-2 rounded-full bg-[#F5F5F5] dark:bg-[#1a1a1a] border border-[#E5E5E5] dark:border-[#333] hover:border-[#FFCC00] hover:bg-white dark:hover:bg-[#222] transition-all duration-200"
                >
                  <Avatar className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} flex-shrink-0`}>
                    <AvatarImage src={channel.thumbnail_url} alt={channel.title} />
                    <AvatarFallback className="bg-[#E5E5E5] dark:bg-[#333]">
                      <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />
                    </AvatarFallback>
                  </Avatar>
                  <span className={`${isMobile ? 'text-[11px]' : 'text-sm'} font-semibold text-[#1A1A1A] dark:text-[#e8e8e8] group-hover:text-[#FF0000] transition-colors whitespace-nowrap`}>
                    {channel.title}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Shorts Section */}
        {filteredShorts.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} bg-red-500 rounded flex items-center justify-center`}>
                <Play className="h-2 w-2 text-white fill-white" />
              </div>
              <h2 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-[#606060] dark:text-[#aaa] uppercase tracking-wide`}>Shorts</h2>
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
                  <p className={`mt-1.5 ${isMobile ? 'text-[10px]' : 'text-[11px]'} font-medium text-[#1A1A1A] dark:text-[#e8e8e8] line-clamp-2 leading-tight`}>
                    {short.title}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Videos Section - YouTube-style list */}
        {filteredVideos.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Play className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-[#999999]`} />
              <h2 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-[#606060] dark:text-[#aaa] uppercase tracking-wide`}>Videos</h2>
            </div>

            <div className="space-y-3">
              {filteredVideos.map((video: any) => (
                <Link
                  key={video.id}
                  to={`/video/${video.video_id || video.id}`}
                  className="group flex gap-3 rounded-xl hover:bg-[#F5F5F5] dark:hover:bg-[#1a1a1a] transition-colors p-1.5 -mx-1.5"
                >
                  {/* Thumbnail */}
                  <div className={`${isMobile ? 'w-[140px]' : 'w-[280px]'} flex-shrink-0 aspect-video rounded-xl overflow-hidden bg-[#F0F0F0] dark:bg-[#222] relative`}>
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <h3 className={`${isMobile ? 'text-xs' : 'text-base'} font-semibold text-[#1A1A1A] dark:text-[#e8e8e8] line-clamp-2 leading-snug`}>
                      {video.title}
                    </h3>

                    {/* Views & date */}
                    <p className={`${isMobile ? 'text-[10px] mt-0.5' : 'text-xs mt-1'} text-[#606060] dark:text-[#aaa]`}>
                      {formatViews(video.views || 0)} • {formatDate(video.uploaded_at)}
                    </p>

                    {/* Channel info */}
                    <div className={`flex items-center gap-1.5 ${isMobile ? 'mt-1.5' : 'mt-2.5'}`}>
                      <Avatar className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0`}>
                        <AvatarImage src={channelThumbnails[video.channel_id]} alt={video.channel_name} />
                        <AvatarFallback className="bg-[#E5E5E5] dark:bg-[#333] text-[8px] font-bold text-[#666]">
                          {video.channel_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-[#606060] dark:text-[#aaa] truncate`}>
                        {video.channel_name}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* No results at all */}
        {totalResults === 0 && (
          <div className="text-center py-16">
            <SearchIcon className="w-10 h-10 mx-auto mb-3 text-[#E5E5E5] dark:text-[#444]" />
            <p className="text-sm font-medium text-[#999999]">No results found for "{query}"</p>
            <p className="text-xs text-[#CCCCCC] mt-1">Try different keywords</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
