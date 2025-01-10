import {
  Home,
  Flame,
  Clock,
  BookOpen,
  Music,
  UtensilsCrossed,
  GraduationCap,
  Calendar,
} from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const menuItems = [
  { icon: Home, label: "Home" },
  { icon: Flame, label: "Trending" },
  { icon: Clock, label: "History" },
  { icon: BookOpen, label: "Torah Study" },
  { icon: Music, label: "Jewish Music" },
  { icon: UtensilsCrossed, label: "Kosher Cooking" },
  { icon: GraduationCap, label: "Learning" },
  { icon: Calendar, label: "Jewish Calendar" },
];

export const Sidebar = () => {
  return (
    <ShadcnSidebar className="border-r border-gray-200 bg-white">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton className="hover:bg-muted">
                    <item.icon className="h-4 w-4 text-secondary" />
                    <span className="text-secondary">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadcnSidebar>
  );
};