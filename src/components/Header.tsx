import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, LayoutDashboard, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
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

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .single();
      return data;
    },
  });

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

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
  };

  const hasResults = searchResults.videos.length > 0 || searchResults.channels.length > 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="hidden font-bold sm:inline-block text-primary">
            Jewish Tube
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 relative">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search videos and channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="w-full pl-8 h-8 bg-transparent border-none focus:ring-0 text-sm placeholder:text-muted-foreground"
            />
          </div>
          {showResults && searchQuery && hasResults && (
            <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="max-h-60 overflow-y-auto">
                {searchResults.channels.length > 0 && (
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                    Channels
                  </div>
                )}
                {searchResults.channels.map((channel) => (
                  <Link
                    key={channel.channel_id}
                    to={`/channel/${channel.channel_id}`}
                    className="block px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="text-primary">{channel.title}</span>
                  </Link>
                ))}
                {searchResults.videos.length > 0 && (
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                    Videos
                  </div>
                )}
                {searchResults.videos.map((video) => (
                  <Link
                    key={video.id}
                    to={`/video/${video.id}`}
                    className="block px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="text-primary">{video.title}</span>
                    <p className="text-sm text-gray-500">{video.channel_name}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </form>

        <nav className="flex items-center space-x-2">
          {session ? (
            <div className="flex items-center space-x-2">
              {profile?.is_admin && (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hover:bg-transparent p-0"
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-5 w-5 text-primary stroke-[1.5] hover:scale-110 transition-transform stroke-black" />
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="hover:bg-transparent p-0"
              >
                <Link to="/settings">
                  <Settings className="h-5 w-5 text-primary stroke-[1.5] hover:scale-110 transition-transform stroke-black" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="hover:bg-transparent p-0"
              >
                <LogOut className="h-5 w-5 text-primary stroke-[1.5] hover:scale-110 transition-transform stroke-black" />
              </Button>
              <Avatar>
                <AvatarImage src={session.user.user_metadata.avatar_url} />
                <AvatarFallback>
                  {session.user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <Button variant="default" asChild className="bg-primary hover:bg-primary/90 text-white">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};