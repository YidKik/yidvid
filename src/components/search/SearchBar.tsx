import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    videos: any[];
    channels: any[];
  }>({ videos: [], channels: [] });

  useEffect(() => {
    const searchContent = async () => {
      if (searchQuery.length < 2) {
        setSearchResults({ videos: [], channels: [] });
        return;
      }

      const searchTerm = `%${searchQuery}%`;

      const [videosResponse, channelsResponse] = await Promise.all([
        supabase
          .from("youtube_videos")
          .select("id, title, channel_name")
          .ilike("title", searchTerm)
          .limit(5),
        supabase
          .from("youtube_channels")
          .select("channel_id, title")
          .ilike("title", searchTerm)
          .limit(3),
      ]);

      setSearchResults({
        videos: videosResponse.data || [],
        channels: channelsResponse.data || [],
      });
    };

    const debounceTimeout = setTimeout(searchContent, 150);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!open) setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " && !searchQuery) {
      e.preventDefault();
    }
  };

  const hasResults = searchResults.videos.length > 0 || searchResults.channels.length > 0;

  return (
    <div className="flex-1 max-w-2xl px-4">
      <Popover open={open && hasResults} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              type="search"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 py-6 rounded-xl bg-white border-transparent focus:border-gray-300 hover:border-gray-300 transition-colors duration-200 text-black placeholder:text-gray-500"
            />
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[500px] p-0 shadow-lg bg-white" 
          align="start"
          sideOffset={5}
        >
          <Command className="bg-white">
            <CommandList className="max-h-[300px] overflow-y-auto scrollbar-hide">
              {searchResults.channels.length > 0 && (
                <CommandGroup heading="Channels" className="px-2 text-gray-600">
                  {searchResults.channels.map((channel) => (
                    <CommandItem
                      key={channel.channel_id}
                      onSelect={() => {
                        setOpen(false);
                        setSearchQuery("");
                      }}
                      className="px-4 py-2 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <Link
                        to={`/channel/${channel.channel_id}`}
                        className="flex items-center gap-2 w-full"
                      >
                        <Search className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-800 hover:text-black transition-colors">
                          {channel.title}
                        </span>
                      </Link>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {searchResults.videos.length > 0 && (
                <CommandGroup heading="Videos" className="px-2 text-gray-600">
                  {searchResults.videos.map((video) => (
                    <CommandItem
                      key={video.id}
                      onSelect={() => {
                        setOpen(false);
                        setSearchQuery("");
                      }}
                      className="px-4 py-2 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <Link
                        to={`/video/${video.id}`}
                        className="flex items-center gap-2 w-full"
                      >
                        <Search className="h-4 w-4 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="text-gray-800 hover:text-black transition-colors">
                            {video.title}
                          </span>
                          <span className="text-sm text-gray-500">
                            {video.channel_name}
                          </span>
                        </div>
                      </Link>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};