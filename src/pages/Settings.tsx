import { useEffect, useState } from "react";
import "@/styles/pages/settings.css";
import { BackButton } from "@/components/navigation/BackButton";
import { Settings as SettingsIcon, User, Video, History, Palette, HelpCircle, Shield } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useSettingsPageState } from "@/hooks/useSettingsPageState";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { ProfileSectionSkeleton } from "@/components/settings/profile/ProfileSectionSkeleton";
import { ContentPreferencesSection } from "@/components/settings/sections/ContentPreferencesSection";
import { ActivitySection } from "@/components/settings/sections/ActivitySection";
import { AppearanceSection } from "@/components/settings/sections/AppearanceSection";
import { AdminSection } from "@/components/settings/sections/AdminSection";
import { SupportSection } from "@/components/settings/sections/SupportSection";
import { cn } from "@/lib/utils";

const Settings = () => {
  const { 
    userId, loadingProfile, sectionsReady, authChecked,
    backgroundColor, textColor, buttonColor, logoColor,
    setBackgroundColor, setTextColor, setButtonColor, setLogoColor,
    autoplay, setAutoplay, resetToDefaults, saveColors
  } = useSettingsPageState();
  
  const { isMobile } = useIsMobile();
  const { isAdmin } = useAdminStatus(userId);
  const [activeSection, setActiveSection] = useState("profile");

  const navItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "content", label: "Content", icon: Video },
    { id: "activity", label: "Activity", icon: History },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "support", label: "Support", icon: HelpCircle },
    ...(userId ? [{ id: "admin", label: "Admin", icon: Shield }] : []),
  ];

  // Show loading state while verifying auth
  if (!authChecked) {
    return (
      <div 
        className="min-h-screen bg-white pt-16 px-4 pl-[200px] transition-all duration-300"
        style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
      >
        <div className="max-w-4xl">
          <BackButton />
          <div className="h-8 w-56 bg-gray-100 rounded-lg mb-8 animate-pulse"></div>
          <ProfileSectionSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-white pt-14 pl-[200px] transition-all duration-300"
      style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
    >
      <BackButton />
      <main className={`${isMobile ? 'pt-4 px-4' : 'pt-6 px-6'} pb-16 max-w-5xl`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#FFCC00]">
          <div className="p-2.5 bg-[#FFCC00] rounded-xl">
            <SettingsIcon className="w-5 h-5 text-[#1A1A1A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Manage your account and preferences</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200",
                  isActive 
                    ? "bg-red-500 text-white shadow-md" 
                    : "bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-gray-900"
                )}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-5 md:p-6">
          {activeSection === "profile" && (
            loadingProfile ? <ProfileSectionSkeleton /> : <ProfileSection />
          )}
          
          {activeSection === "content" && sectionsReady && (
            <ContentPreferencesSection 
              userId={userId}
              autoplay={autoplay}
              setAutoplay={setAutoplay}
            />
          )}
          
          {activeSection === "activity" && sectionsReady && (
            <ActivitySection />
          )}
          
          {activeSection === "appearance" && sectionsReady && (
            <AppearanceSection 
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              textColor={textColor}
              setTextColor={setTextColor}
              buttonColor={buttonColor}
              setButtonColor={setButtonColor}
              logoColor={logoColor}
              setLogoColor={setLogoColor}
              saveColors={saveColors}
              resetToDefaults={resetToDefaults}
            />
          )}
          
          {activeSection === "support" && sectionsReady && (
            <SupportSection />
          )}
          
          {activeSection === "admin" && sectionsReady && userId && (
            <AdminSection userId={userId} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;
