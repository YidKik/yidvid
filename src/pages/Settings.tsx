import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSettingsPageState } from "@/hooks/useSettingsPageState";
import { ProfileSectionSkeleton } from "@/components/settings/profile/ProfileSectionSkeleton";
import { cn } from "@/lib/utils";
import { User, TrendingUp, Tv2, HelpCircle, Settings as SettingsIcon } from "lucide-react";
import { SettingsProfile } from "@/components/settings/redesign/SettingsProfile";
import { SettingsActivity } from "@/components/settings/redesign/SettingsActivity";
import { SettingsContent } from "@/components/settings/redesign/SettingsContent";
import { SettingsSupport } from "@/components/settings/redesign/SettingsSupport";

const Settings = () => {
  const { loadingProfile, authChecked } = useSettingsPageState();
  const { isMobile } = useIsMobile();
  const [activeSection, setActiveSection] = useState("profile");

  const navItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "activity", label: "Activity", icon: TrendingUp },
    { id: "content", label: "Content", icon: Tv2 },
    { id: "support", label: "Support", icon: HelpCircle },
  ];

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-white dark:bg-background pt-16 px-4 pl-0 lg:pl-[var(--sidebar-w)] transition-all duration-300">
        <div className="max-w-4xl mx-auto">
          <ProfileSectionSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted dark:bg-background pt-12 pl-0 lg:pl-[var(--sidebar-w)] pb-nav lg:pb-8 transition-all duration-300">
      <div className={cn(
        "max-w-5xl mx-auto",
        isMobile ? "px-4 pt-4" : "px-8 pt-6"
      )}>
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary rounded-card">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className={cn(
            "font-bold text-foreground dark:text-foreground",
            isMobile ? "text-xl" : "text-2xl"
          )}>
            Settings
          </h1>
        </div>

        {/* Layout: sidebar nav on desktop, horizontal tabs on mobile */}
        <div className={cn(
          isMobile ? "flex flex-col gap-4" : "flex gap-6"
        )}>
          {/* Navigation */}
          <nav className={cn(
            isMobile
              ? "flex gap-2 overflow-x-auto scrollbar-hide p-1 -m-1"
              : "flex flex-col gap-1 w-[200px] shrink-0 sticky top-20 self-start"
          )}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200 whitespace-nowrap",
                    isMobile
                      ? "min-h-11 px-4 type-label rounded-control border"
                      : "min-h-11 px-4 type-label rounded-control w-full text-left",
                    isActive
                      ? isMobile
                        ? "bg-primary text-primary-foreground border-brand"
                        : "bg-white dark:bg-card text-brand shadow-sm border border-border dark:border-border"
                      : isMobile
                        ? "text-muted-foreground border-border dark:border-border dark:text-muted-foreground hover:bg-white dark:hover:bg-card"
                        : "text-muted-foreground dark:text-muted-foreground hover:bg-white dark:hover:bg-card hover:text-foreground dark:hover:text-foreground border border-transparent"
                  )}
                >
                  <Icon size={isMobile ? 16 : 18} aria-hidden />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className={cn(
              "bg-white dark:bg-card rounded-card border border-border dark:border-border shadow-sm",
              isMobile ? "p-4" : "p-6"
            )}>
              {activeSection === "profile" && (
                loadingProfile ? <ProfileSectionSkeleton /> : <SettingsProfile />
              )}
              {activeSection === "activity" && <SettingsActivity />}
              {activeSection === "content" && <SettingsContent />}
              {activeSection === "support" && <SettingsSupport />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
