import { Bell, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface AdminHeaderV2Props {
  pageTitle: string;
  pageDescription?: string;
  profile: any;
}

export const AdminHeaderV2 = ({ pageTitle, pageDescription, profile }: AdminHeaderV2Props) => {
  const [searchOpen, setSearchOpen] = useState(false);

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
    <header className="h-[60px] bg-[#0f1117] border-b border-[#1e2028] flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-[15px] font-semibold text-white leading-tight">{pageTitle}</h1>
        {pageDescription && (
          <p className="text-[11px] text-[#565b6e] mt-0.5">{pageDescription}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg hover:bg-[#1a1c25] transition-colors">
          <Bell className="w-[18px] h-[18px] text-[#8b8fa3]" />
          {(unreadCount ?? 0) > 0 && (
            <span className="absolute top-1 right-1 w-[7px] h-[7px] rounded-full bg-[#ef4444] ring-2 ring-[#0f1117]" />
          )}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#1e2028]">
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-medium text-[#c4c7d4] leading-tight">
              {profile?.display_name || profile?.email?.split("@")[0] || "Admin"}
            </p>
            <p className="text-[10px] text-[#565b6e]">Administrator</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white font-semibold text-xs">
            {(profile?.display_name || profile?.email || "A")[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
