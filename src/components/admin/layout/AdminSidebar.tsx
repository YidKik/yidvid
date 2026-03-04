import {
  LayoutDashboard,
  Shield,
  Video,
  Music,
  Users,
  Tag,
  MessageSquare,
  Mail,
  Bell,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "moderation", label: "Content Moderation", icon: Shield },
  { id: "videos-channels", label: "Videos & Channels", icon: Video },
  { id: "music", label: "Music Artists", icon: Music },
  { id: "users", label: "Users", icon: Users },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "contact-requests", label: "Contact Requests", icon: Mail },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const AdminSidebar = ({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
}: AdminSidebarProps) => {
  return (
    <aside
      className={cn(
        "h-screen flex flex-col bg-[hsl(220,20%,14%)] text-[hsl(220,10%,70%)] transition-all duration-200 shrink-0",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-4 border-b border-[hsl(220,15%,20%)] gap-3">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[hsl(250,80%,60%)] flex items-center justify-center text-white font-bold text-sm shrink-0">
              A
            </div>
            <span className="font-semibold text-white text-sm whitespace-nowrap">
              Admin Panel
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="ml-auto p-1.5 rounded-md hover:bg-[hsl(220,15%,22%)] text-[hsl(220,10%,60%)] hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[hsl(250,80%,60%)] text-white"
                  : "hover:bg-[hsl(220,15%,20%)] hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("w-[18px] h-[18px] shrink-0", collapsed && "mx-auto")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-[hsl(220,15%,20%)]">
          <p className="text-[11px] text-[hsl(220,10%,45%)]">YidVid Admin v2.0</p>
        </div>
      )}
    </aside>
  );
};
