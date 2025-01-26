import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, LayoutDashboard, Bell, Search } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import Auth from "@/pages/Auth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: searchResults } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return { videos: [], channels: [] };

      const [videosResponse, channelsResponse] = await Promise.all([
        supabase
          .from("youtube_videos")
          .select("id, title, channel_name")
          .ilike("title", `%${searchQuery}%`)
          .limit(5),
        supabase
          .from("youtube_channels")
          .select("channel_id, title")
          .ilike("title", `%${searchQuery}%`)
          .limit(3),
      ]);

      return {
        videos: videosResponse.data || [],
        channels: channelsResponse.data || [],
      };
    },
    enabled: searchQuery.length >= 2,
  });

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center space-x-2 mr-4">
          <span className="text-xl font-bold">Jewish Tube</span>
        </Link>

        <div className="flex-1 flex justify-center px-4">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative w-full max-w-sm">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full py-2 pl-10 pr-4 text-sm border-b border-[#222222] focus:border-[#000000] outline-none transition-colors bg-transparent text-black"
                />
                <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#222222]" />
              </div>
            </PopoverTrigger>
            {searchQuery.length >= 2 && (
              <PopoverContent 
                className="w-[400px] p-0 bg-white border-[#222222]" 
                align="start"
                sideOffset={5}
              >
                <Command>
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {searchResults?.channels && searchResults.channels.length > 0 && (
                      <CommandGroup heading="Channels" className="text-[#222222]">
                        {searchResults.channels.map((channel) => (
                          <CommandItem
                            key={channel.channel_id}
                            onSelect={() => {
                              navigate(`/channel/${channel.channel_id}`);
                              setSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="hover:bg-gray-50"
                          >
                            <span>{channel.title}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    {searchResults?.videos && searchResults.videos.length > 0 && (
                      <CommandGroup heading="Videos" className="text-[#222222]">
                        {searchResults.videos.map((video) => (
                          <CommandItem
                            key={video.id}
                            onSelect={() => {
                              navigate(`/video/${video.id}`);
                              setSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="hover:bg-gray-50"
                          >
                            <div className="flex flex-col">
                              <span>{video.title}</span>
                              <span className="text-xs text-[#666666]">
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
            )}
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
