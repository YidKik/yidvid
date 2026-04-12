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
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-16 px-4 pl-0 lg:pl-[200px] transition-all duration-300">
        <div className="max-w-4xl mx-auto">
          <ProfileSectionSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0f0f0f] pt-14 pl-0 lg:pl-[200px] pb-24 lg:pb-8 transition-all duration-300">
      <div className={cn(
        "max-w-5xl mx-auto",
        isMobile ? "px-4 pt-4" : "px-8 pt-6"
      )}>
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#FF0000] rounded-xl">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className={cn(
            "font-bold text-[#1A1A1A] dark:text-[#e8e8e8]",
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
              ? "flex gap-2 overflow-x-auto scrollbar-hide pb-1"
              : "flex flex-col gap-1 w-[200px] shrink-0 sticky top-20 self-start"
          )}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex items-center gap-2.5 font-semibold transition-all duration-200 whitespace-nowrap",
                    isMobile
                      ? "px-4 py-2 text-xs rounded-full border"
                      : "px-4 py-2.5 text-sm rounded-xl w-full text-left",
                    isActive
                      ? isMobile
                        ? "bg-[#FF0000] text-white border-[#FF0000]"
                        : "bg-white dark:bg-[#1a1a1a] text-[#FF0000] shadow-sm border border-[#E5E5E5] dark:border-[#333]"
                      : isMobile
                        ? "text-[#666] border-[#E5E5E5] dark:border-[#333] dark:text-[#aaa] hover:bg-white dark:hover:bg-[#1a1a1a]"
                        : "text-[#666] dark:text-[#aaa] hover:bg-white dark:hover:bg-[#1a1a1a] hover:text-[#1A1A1A] dark:hover:text-[#e8e8e8] border border-transparent"
                  )}
                >
                  <Icon size={isMobile ? 14 : 18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className={cn(
              "bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#E5E5E5] dark:border-[#333] shadow-sm",
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
