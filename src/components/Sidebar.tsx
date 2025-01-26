import {
  Home,
  Flame,
  Clock,
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
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  { icon: Home, label: "Home" },
  { icon: Flame, label: "Trending" },
  { icon: Clock, label: "History" },
  { icon: Music, label: "Jewish Music" },
  { icon: UtensilsCrossed, label: "Kosher Cooking" },
  { icon: GraduationCap, label: "Learning" },
  { icon: Calendar, label: "Jewish Calendar" },
];

export const Sidebar = () => {
  const isMobile = useIsMobile();

  return (
    <ShadcnSidebar className="border-r border-gray-200 bg-white">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton className="hover:bg-muted py-2 md:py-3">
                    <item.icon className="h-4 w-4 md:h-5 md:w-5 text-secondary" />
                    <span className="text-secondary text-sm md:text-base">{item.label}</span>
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