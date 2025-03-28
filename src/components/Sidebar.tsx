import {
  Home,
  Flame,
  Clock,
  Music,
  UtensilsCrossed,
  GraduationCap,
  Calendar,
  Menu,
  X,
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
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const menuGroups = [
  [
    { icon: Home, label: "Home" },
    { icon: Flame, label: "Trending" },
    { icon: Clock, label: "History" },
  ],
  [
    { icon: Music, label: "Jewish Music" },
    { icon: UtensilsCrossed, label: "Kosher Cooking" },
    { icon: GraduationCap, label: "Learning" },
  ],
  [
    { icon: Calendar, label: "Jewish Calendar" },
  ],
];

export const Sidebar = () => {
  const { isMobile } = useIsMobile();
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Log current device state for debugging
  useEffect(() => {
    console.log("Sidebar component - isMobile:", isMobile);
  }, [isMobile]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isMenuOpen) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isMenuOpen]);

  return (
    <ShadcnSidebar className="border-r border-gray-200 bg-white sidebar">
      <motion.button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isMenuOpen ? (
          <X className="h-5 w-5 text-secondary" />
        ) : (
          <Menu className="h-5 w-5 text-secondary" />
        )}
      </motion.button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className={`mt-16 ${isMobile ? 'fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40' : ''}`}
          >
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuGroups.map((group, groupIndex) => (
                      <div key={groupIndex} className="mb-2">
                        <motion.button
                          className="w-full p-2 rounded-lg hover:bg-muted flex items-center justify-center"
                          onClick={() => setExpandedGroup(expandedGroup === groupIndex ? null : groupIndex)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex space-x-2">
                            {group.slice(0, 3).map((item, idx) => (
                              <item.icon 
                                key={idx} 
                                className="h-4 w-4 md:h-5 md:w-5 text-secondary"
                              />
                            ))}
                          </div>
                        </motion.button>
                        
                        <AnimatePresence>
                          {expandedGroup === groupIndex && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              {group.map((item, index) => (
                                <motion.div
                                  key={item.label}
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  exit={{ x: -20, opacity: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <SidebarMenuItem>
                                    <SidebarMenuButton 
                                      className="hover:bg-muted py-2 md:py-3 mt-2"
                                      onClick={() => isMobile && setIsMenuOpen(false)}
                                    >
                                      <item.icon className="h-4 w-4 md:h-5 md:w-5 text-secondary" />
                                      <span className="text-secondary text-sm md:text-base">
                                        {item.label}
                                      </span>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </motion.div>
        )}
      </AnimatePresence>
    </ShadcnSidebar>
  );
};
