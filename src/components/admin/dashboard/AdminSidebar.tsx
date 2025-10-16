import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Shield, 
  FolderOpen, 
  Users, 
  Tag, 
  Video,
  ChevronLeft,
  ChevronRight,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: "Overview", 
    value: "overview",
    description: "Dashboard statistics"
  },
  { 
    icon: Shield, 
    label: "AI Filtering", 
    value: "content-analysis",
    description: "Content moderation"
  },
  { 
    icon: FolderOpen, 
    label: "Content", 
    value: "content",
    description: "Manage content"
  },
  { 
    icon: Users, 
    label: "Users", 
    value: "users",
    description: "User management"
  },
  { 
    icon: Tag, 
    label: "Channel Categories", 
    value: "channel-categories",
    description: "Categorize channels"
  },
  { 
    icon: Video, 
    label: "Video Categories", 
    value: "categories",
    description: "Manage categories"
  },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="h-screen sticky top-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700 flex flex-col"
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Admin Panel</h2>
                <p className="text-gray-400 text-xs">Management Dashboard</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white hover:bg-gray-700"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.value;
          
          return (
            <motion.button
              key={item.value}
              onClick={() => onTabChange(item.value)}
              whileHover={{ x: 4 }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isActive 
                  ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/30' 
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : ''}`} />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium text-sm">{item.label}</div>
                    {!isActive && (
                      <div className="text-xs opacity-70">{item.description}</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              {isActive && !collapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  className="w-1 h-8 bg-white rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        {!collapsed && (
          <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-400">
            <p className="font-medium text-white mb-1">Quick Tip</p>
            <p>Use the sidebar to navigate between different admin sections</p>
          </div>
        )}
      </div>
    </motion.aside>
  );
};
