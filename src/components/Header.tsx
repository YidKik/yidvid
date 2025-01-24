import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchBar } from "./search/SearchBar";
import { Settings, LogOut, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

export const Header = () => {
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="hidden font-bold sm:inline-block text-primary">
            Jewish Tube
          </span>
        </Link>

        <SearchBar />

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {session ? (
              <div className="flex items-center space-x-2">
                {profile?.is_admin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="hover:bg-accent"
                  >
                    <Link to="/dashboard">
                      <LayoutDashboard className="h-5 w-5" />
                    </Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hover:bg-accent"
                >
                  <Link to="/settings">
                    <Settings className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="hover:bg-accent text-red-600"
                >
                  <LogOut className="h-5 w-5" />
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
      </div>
    </header>
  );
};