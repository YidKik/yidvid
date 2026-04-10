import {
  LayoutDashboard,
  MonitorPlay,
  Shield,
  Users,
  MessageSquare,
  Mail,
  BarChart3,
  Tag,
  ChevronLeft,
  ChevronRight,
  LogOut,
  GitPullRequest,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const navSections = [
  {
    label: "Main",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Content",
    items: [
      { id: "channels", label: "Channels & Videos", icon: MonitorPlay },
      { id: "moderation", label: "Moderation", icon: Shield },
      { id: "categories", label: "Categories", icon: Tag },
    ],
  },
  {
    label: "Community",
    items: [
      { id: "users", label: "Users", icon: Users },
      { id: "comments", label: "Comments", icon: MessageSquare },
      { id: "contacts", label: "Contact Requests", icon: Mail },
      { id: "requests", label: "Channel Requests", icon: GitPullRequest },
    ],
  },
];

interface AdminSidebarV2Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const AdminSidebarV2 = ({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
}: AdminSidebarV2Props) => {
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        "h-screen flex flex-col transition-all duration-300 shrink-0 border-r",
        "bg-[#0f1117] border-[#1e2028] text-[#8b8fa3]",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo / Brand */}
      <div className="h-[60px] flex items-center px-4 border-b border-[#1e2028]">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm shrink-0">
              Y
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-white text-[13px] block leading-tight">
                YidVid
              </span>
              <span className="text-[10px] text-[#565b6e] leading-tight">
                Admin Console
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm mx-auto">
            Y
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="text-[10px] uppercase tracking-wider text-[#4a4e5e] font-semibold mb-2 px-3">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                      isActive
                        ? "bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/20"
                        : "hover:bg-[#1a1c25] hover:text-[#c4c7d4] border border-transparent"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={cn(
                        "w-[18px] h-[18px] shrink-0",
                        collapsed && "mx-auto",
                        isActive ? "text-[#818cf8]" : ""
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1e2028] p-3 space-y-1">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-[#8b8fa3] hover:bg-[#1a1c25] hover:text-[#c4c7d4] transition-colors border border-transparent"
          title={collapsed ? "Exit Admin" : undefined}
        >
          <LogOut className={cn("w-[18px] h-[18px] shrink-0", collapsed && "mx-auto")} />
          {!collapsed && <span>Exit Admin</span>}
        </button>

        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-[#1a1c25] text-[#565b6e] hover:text-[#8b8fa3] transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};
