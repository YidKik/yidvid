
import { useEffect } from "react";
import { BackButton } from "@/components/navigation/BackButton";
import { Settings as SettingsIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useSettingsPageState } from "@/hooks/useSettingsPageState";
// Removed AdminDashboardCard import - dashboard access via shortcuts only
import { ProfileSection } from "@/components/settings/ProfileSection";
import { ProfileSectionSkeleton } from "@/components/settings/profile/ProfileSectionSkeleton";
import { ContentPreferencesSection } from "@/components/settings/sections/ContentPreferencesSection";
import { ActivitySection } from "@/components/settings/sections/ActivitySection";
import { AppearanceSection } from "@/components/settings/sections/AppearanceSection";
import { AdminSection } from "@/components/settings/sections/AdminSection";
import { SupportSection } from "@/components/settings/sections/SupportSection";

const Settings = () => {
  const { 
    userId, loadingProfile, sectionsReady, authChecked,
    backgroundColor, textColor, buttonColor, logoColor,
    setBackgroundColor, setTextColor, setButtonColor, setLogoColor,
    autoplay, setAutoplay, resetToDefaults, saveColors
  } = useSettingsPageState();
  
  const { isMobile } = useIsMobile();
  
  // Admin status check
  const { isAdmin, hasPinBypass } = useAdminStatus(userId);

  // Show loading state while verifying auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <BackButton />
          <div className="animate-pulse">
            <div className="h-8 w-56 bg-gray-200 rounded mb-8"></div>
            <ProfileSectionSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <BackButton />
      <main className={`container mx-auto ${isMobile ? 'pt-14 px-4 md:px-6 max-w-[95%]' : 'pt-24 px-4'} pb-16 max-w-4xl`}>
        <div className={`mb-6 md:mb-8 flex items-center gap-3 p-4 bg-card text-card-foreground rounded-3xl border-2 border-primary/20 shadow-lg`}>
          <div className="p-2 bg-primary/10 rounded-2xl">
            <SettingsIcon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
          </div>
          <div>
            <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-primary`}>Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your preferences and account</p>
          </div>
        </div>

        {/* Removed Admin Dashboard Card */}

        <div className="space-y-6 md:space-y-8">
          {/* Profile section always shows first, either real or skeleton */}
          {loadingProfile ? <ProfileSectionSkeleton /> : <ProfileSection />}
          
          {/* Only render other sections once we're ready */}
          {sectionsReady && (
            <>
              <ContentPreferencesSection 
                userId={userId}
                autoplay={autoplay}
                setAutoplay={setAutoplay}
              />
              <ActivitySection />
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
              {userId && <AdminSection userId={userId} />}
              <SupportSection />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;
