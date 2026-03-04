import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface AdminHeaderProps {
  pageTitle: string;
  profile: any;
}

export const AdminHeader = ({ pageTitle, profile }: AdminHeaderProps) => {
  const { data: unreadCount } = useQuery({
    queryKey: ["admin-notifications-unread-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("admin_notifications")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);
      if (error) return 0;
      return count || 0;
    },
    refetchInterval: 30000,
  });

  return (
    <header className="h-16 bg-white border-b border-[hsl(220,13%,90%)] flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-[hsl(220,15%,20%)]">{pageTitle}</h1>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg hover:bg-[hsl(220,14%,96%)] transition-colors">
          <Bell className="w-5 h-5 text-[hsl(220,10%,45%)]" />
          {(unreadCount ?? 0) > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] px-1 text-[10px] bg-[hsl(0,72%,51%)] text-white border-2 border-white">
              {unreadCount! > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-[hsl(220,15%,20%)]">
              {profile?.display_name || profile?.email?.split("@")[0] || "Admin"}
            </p>
            <p className="text-xs text-[hsl(220,10%,55%)]">Administrator</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[hsl(250,80%,60%)] flex items-center justify-center text-white font-semibold text-sm">
            {(profile?.display_name || profile?.email || "A")[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
