import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, LayoutDashboard, Bell, Search } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import Auth from "@/pages/Auth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const Header = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    videos: any[];
    channels: any[];
  }>({ videos: [], channels: [] });

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  useEffect(() => {
    const searchContent = async () => {
      try {
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

        if (videosResponse.error) throw videosResponse.error;
        if (channelsResponse.error) throw channelsResponse.error;

        setSearchResults({
          videos: videosResponse.data || [],
          channels: channelsResponse.data || [],
        });
      } catch (error) {
        console.error('Search error:', error);
      }
    };

    const debounceTimeout = setTimeout(searchContent, 150);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const hasResults = searchResults.videos.length > 0 || searchResults.channels.length > 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center space-x-2 mr-4">
          <span className="text-xl font-bold">Jewish Tube</span>
        </Link>

        <div className="flex-1 max-w-md mx-auto">
          <Popover open={open && searchQuery.length >= 2} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative flex items-center">
                  <Search className="absolute left-2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!open) setOpen(true);
                    }}
                    className="w-full pl-8 h-9 bg-white border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-gray-400"
                  />
                </div>
              </form>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[400px] p-0 shadow-lg bg-white rounded-xl" 
              align="start"
              sideOffset={5}
            >
              <Command className="bg-white rounded-xl">
                <CommandList className="max-h-[300px] overflow-y-auto scrollbar-hide">
                  {!hasResults && searchQuery.length >= 2 && (
                    <div className="py-6 text-center text-gray-500">
                      No results found
                    </div>
                  )}
                  {searchResults.channels.length > 0 && (
                    <CommandGroup heading="Channels" className="px-2">
                      {searchResults.channels.map((channel) => (
                        <CommandItem
                          key={channel.channel_id}
                          onSelect={() => {
                            setOpen(false);
                            setSearchQuery("");
                            navigate(`/channel/${channel.channel_id}`);
                          }}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <Search className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{channel.title}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {searchResults.videos.length > 0 && (
                    <CommandGroup heading="Videos" className="px-2">
                      {searchResults.videos.map((video) => (
                        <CommandItem
                          key={video.id}
                          onSelect={() => {
                            setOpen(false);
                            setSearchQuery("");
                            navigate(`/video/${video.id}`);
                          }}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <Search className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="flex flex-col">
                            <span>{video.title}</span>
                            <span className="text-sm text-gray-500">
                              {video.channel_name}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {session ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="bg-[#222222] hover:bg-[#333333] text-white">
                    <Bell className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#222222] border-[#333333]">
                  <ScrollArea className="h-[300px] w-[300px] p-4">
                    <p className="text-sm text-white/70">No new notifications</p>
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => setIsAuthOpen(true)}>Login</Button>
          )}
        </div>
      </div>
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </header>
  );
};

export default Header;