import { useState } from "react";
import "@/styles/pages/settings.css";
import { BackButton } from "@/components/navigation/BackButton";
import { Settings as SettingsIcon, User, History, HelpCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSettingsPageState } from "@/hooks/useSettingsPageState";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { ProfileSectionSkeleton } from "@/components/settings/profile/ProfileSectionSkeleton";
import { ActivitySection } from "@/components/settings/sections/ActivitySection";
import { SupportSection } from "@/components/settings/sections/SupportSection";
import { cn } from "@/lib/utils";

const Settings = () => {
  const { 
    userId, loadingProfile, sectionsReady, authChecked,
  } = useSettingsPageState();
  
  const { isMobile } = useIsMobile();
  const [activeSection, setActiveSection] = useState("profile");

  const navItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "activity", label: "Activity", icon: History },
    { id: "support", label: "Support", icon: HelpCircle },
  ];

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-white pt-16 px-4 pl-[200px] transition-all duration-300">
        <div className="max-w-3xl mx-auto">
          <BackButton />
          <div className="h-8 w-56 bg-[#F5F5F5] rounded-lg mb-8 animate-pulse" />
          <ProfileSectionSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-14 pl-[200px] transition-all duration-300">
      <BackButton />
      <main className={cn("pb-16 max-w-3xl mx-auto", isMobile ? "pt-4 px-4" : "pt-6 px-6")}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-[#FFCC00] rounded-xl">
            <SettingsIcon className="w-5 h-5 text-[#1A1A1A]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Settings</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-[#E5E5E5] pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200",
                  isActive 
                    ? "bg-[#FF0000] text-white" 
                    : "text-[#666666] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]"
                )}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div>
          {activeSection === "profile" && (
            loadingProfile ? <ProfileSectionSkeleton /> : <ProfileSection />
          )}
          
          {activeSection === "activity" && sectionsReady && (
            <ActivitySection />
          )}
          
          {activeSection === "support" && sectionsReady && (
            <SupportSection />
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;
