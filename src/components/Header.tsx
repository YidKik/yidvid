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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const Header = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const { data: videos, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .or(`title.ilike.%${searchQuery}%,channel_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order('views', { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error searching videos:", error);
        toast.error("Failed to search videos");
        return [];
      }

      return videos || [];
    },
    enabled: searchQuery.length > 0,
  });

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
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

        <div className="flex-1 flex justify-center px-4">
          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <form onSubmit={handleSearch} className="w-full max-w-lg flex items-center">
                <div className="relative w-full">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 text-sm bg-transparent border-none focus:outline-none focus:ring-0"
                    onClick={() => setIsSearchOpen(true)}
                  />
                </div>
              </form>
            </PopoverTrigger>
            {searchQuery.trim() && (
              <PopoverContent className="w-[400px] p-0 bg-white border border-gray-200 shadow-lg" align="start">
                <ScrollArea className="h-[300px]">
                  {isLoading ? (
                    <div className="p-4 text-sm text-gray-500">Searching...</div>
                  ) : searchResults?.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No results found</div>
                  ) : (
                    <div className="py-2">
                      {searchResults?.map((video) => (
                        <div
                          key={video.id}
                          onClick={() => {
                            navigate(`/video/${video.id}`);
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium line-clamp-1">{video.title}</span>
                            <span className="text-xs text-gray-500">{video.channel_name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            )}
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