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
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
      if (!searchQuery) return [];
      
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .ilike("title", `%${searchQuery}%`)
        .limit(5);

      if (error) {
        console.error("Error searching videos:", error);
        toast.error("Failed to search videos");
        return [];
      }

      return data;
    },
    enabled: searchQuery.length > 0,
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
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="https://euincktvsiuztsxcuqfd.supabase.co/storage/v1/object/public/logos/play_button_outline_and_glyph.png" 
            alt="YidKik Logo"
            className="h-20 w-auto" 
            style={{ 
              objectFit: 'contain',
              minWidth: '80px',
              maxWidth: '80px'
            }}
            onError={(e) => {
              console.error('Logo failed to load:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        </Link>

        <div className="flex-1 px-4">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <div className="flex items-center w-full max-w-sm cursor-text">
                <Search className="h-4 w-4 text-black mr-2" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  className="w-full bg-transparent border-none outline-none text-black placeholder:text-gray-500 focus:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={() => setSearchOpen(true)}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[300px] p-0 bg-white shadow-lg" 
              align="start"
              sideOffset={5}
            >
              <Command>
                <CommandList>
                  {searchResults?.map((video) => (
                    <CommandItem
                      key={video.id}
                      onSelect={() => {
                        navigate(`/video/${video.video_id}`);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100"
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{video.title}</span>
                        <span className="text-xs text-gray-500">{video.channel_name}</span>
                      </div>
                    </CommandItem>
                  ))}
                  {searchQuery && (!searchResults || searchResults.length === 0) && (
                    <div className="p-4 text-sm text-gray-500">
                      No results found
                    </div>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center space-x-2">
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