
import { Helmet } from "react-helmet";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoHistorySection } from "@/components/history/VideoHistorySection";
import { Footer } from "@/components/layout/Footer";
import { History as HistoryIcon, LogIn } from "lucide-react";
import { useSessionManager } from "@/hooks/useSessionManager";
import { Button } from "@/components/ui/button";

export default function History() {
  const { sidebarWidth } = useSidebarContext();
  const { isMobile } = useIsMobile();
  const { isAuthenticated, setIsAuthOpen } = useSessionManager();

  if (!isAuthenticated) {
    return (
      <>
        <Helmet>
          <title>Watch History | YidVid</title>
        </Helmet>
        <div className="min-h-screen pt-14 pl-0 lg:pl-[200px] bg-white dark:bg-background flex flex-col pb-20 lg:pb-0">
          <div className="flex-1 max-w-6xl mx-auto px-4 lg:px-6 py-12">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-card bg-muted dark:bg-secondary flex items-center justify-center mb-6 shadow-sm">
                <HistoryIcon className="w-10 h-10 lg:w-12 lg:h-12 text-brand" />
              </div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground dark:!text-foreground mb-2">Sign in to view your history</h1>
              <p className="text-sm lg:text-base text-muted-foreground dark:!text-muted-foreground mb-6 max-w-md">
                Keep track of videos you've watched. Sign in to access your watch history.
              </p>
              <Button
                onClick={() => setIsAuthOpen(true)}
                className="rounded-control gap-2 bg-primary hover:brightness-90 text-white px-8 py-3 font-semibold transition-all"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Watch History | YidVid</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-white dark:bg-background">
        <div
          className="flex-1 pt-14 transition-all duration-300 pb-20 lg:pb-0"
          style={{ paddingLeft: `${sidebarWidth ? sidebarWidth + 16 : 0}px` }}
        >
          <main className="max-w-5xl mx-auto px-4 lg:px-8 py-8 lg:py-12 flex flex-col flex-1">
            <div className="flex items-center gap-3 mb-10">
              <div
                className="w-10 h-10 rounded-control flex items-center justify-center"
                style={{ backgroundColor: 'hsl(var(--primary))' }}
              >
                <HistoryIcon className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} />
              </div>
              <h1
                className="text-2xl font-bold dark:text-foreground"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                Watch History
              </h1>
            </div>

            <div className="flex-1 pb-8">
              <VideoHistorySection />
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
}
