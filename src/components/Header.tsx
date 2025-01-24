import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, LayoutDashboard, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
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
    console.log("Searching for:", searchQuery);
    // Implement search functionality here
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="hidden font-bold sm:inline-block text-primary">
            Jewish Tube
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 h-8 bg-transparent border-none focus:ring-0 text-sm placeholder:text-muted-foreground"
            />
          </div>
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