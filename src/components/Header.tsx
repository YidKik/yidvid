import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Command,
  CommandEmpty,
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

export const Header = () => {
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

    const debounceTimeout = setTimeout(searchContent, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 px-4">
      <div className="flex items-center justify-between h-full max-w-[1800px] mx-auto">
        <div className="flex items-center gap-2">
          <Link to="/">
            <h1 className="text-xl font-medium text-primary">JewTube</h1>
          </Link>
        </div>
        <div className="flex-1 max-w-2xl px-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!open) setOpen(true);
                  }}
                  className="w-full pl-10 bg-muted rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-youtube-title"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary h-4 w-4" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-0" align="start">
              <Command>
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  {searchResults.channels.length > 0 && (
                    <CommandGroup heading="Channels">
                      {searchResults.channels.map((channel) => (
                        <CommandItem
                          key={channel.channel_id}
                          onSelect={() => {
                            setOpen(false);
                            setSearchQuery("");
                          }}
                        >
                          <Link
                            to={`/channel/${channel.channel_id}`}
                            className="flex items-center gap-2 w-full"
                          >
                            <Search className="h-4 w-4" />
                            <span>{channel.title}</span>
                          </Link>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {searchResults.videos.length > 0 && (
                    <CommandGroup heading="Videos">
                      {searchResults.videos.map((video) => (
                        <CommandItem
                          key={video.id}
                          onSelect={() => {
                            setOpen(false);
                            setSearchQuery("");
                          }}
                        >
                          <Link
                            to={`/video/${video.id}`}
                            className="flex items-center gap-2 w-full"
                          >
                            <Search className="h-4 w-4" />
                            <div className="flex flex-col">
                              <span>{video.title}</span>
                              <span className="text-sm text-muted-foreground">
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};