
import { Settings, LogOut, LayoutDashboard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserMenuProps {
  onLogout: () => Promise<void>;
}

export const UserMenu = ({ onLogout }: UserMenuProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          console.log("No session found for user profile");
          return null;
        }

        console.log("Fetching profile for UserMenu, user ID:", session.user.id);
        
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return null;
        }

        console.log("UserMenu profile data:", data);
        return data;
      } catch (err) {
        console.error("Error in user-profile query:", err);
        return null;
      }
    },
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  console.log("UserMenu profile state:", { profile, isLoading });
  
  const isAdmin = profile?.is_admin === true;
  console.log("Is admin user:", isAdmin);

  if (isMobile) {
    return (
      <Button 
        variant="ghost" 
        size="icon"
        className="h-7 w-7"
        onClick={() => navigate("/settings")}
      >
        <Settings className="h-3.5 w-3.5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-10 w-10"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        side="bottom"
        sideOffset={5}
        alignOffset={0}
        className="w-56 p-2 bg-white rounded-lg shadow-lg border border-gray-100"
      >
        {isAdmin && (
          <>
            <DropdownMenuItem 
              onClick={() => navigate("/dashboard")} 
              className="flex items-center gap-2 p-3 cursor-pointer rounded-md hover:bg-gray-50 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-gray-100" />
          </>
        )}
        <DropdownMenuItem 
          onClick={() => navigate("/settings")} 
          className="flex items-center gap-2 p-3 cursor-pointer rounded-md hover:bg-gray-50 transition-colors"
        >
          <Settings className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1 bg-gray-100" />
        <DropdownMenuItem 
          onClick={onLogout}
          className="flex items-center gap-2 p-3 cursor-pointer rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
