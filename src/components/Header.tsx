import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, LayoutDashboard, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onSignInClick?: () => void;
}

export const Header = ({ onSignInClick }: HeaderProps) => {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkAdminStatus(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkAdminStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return;
    }
    
    setIsAdmin(data?.is_admin || false);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-custom border-b border-gray-200 z-50 px-4">
      <div className="flex items-center justify-between h-full max-w-[1800px] mx-auto">
        <div className="flex items-center gap-4">
          <Link to="/">
            <h1 className="text-2xl font-bold logo-custom">JewTube</h1>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
          <div className="relative group">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-[#222] text-white border-none rounded-full px-6 py-2 focus:outline-none focus:ring-0 transition-all duration-300 placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDashboardClick}
                  className="relative button-custom"
                >
                  <LayoutDashboard className="h-5 w-5" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSettingsClick}
                className="button-custom"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="button-custom"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button onClick={onSignInClick} className="button-custom">Sign In</Button>
          )}
        </div>
      </div>
    </header>
  );
};