
import { Helmet } from "react-helmet";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoHistorySection } from "@/components/history/VideoHistorySection";
import { Footer } from "@/components/layout/Footer";
import { History as HistoryIcon } from "lucide-react";

export default function History() {
  const { sidebarWidth } = useSidebarContext();
  const { isMobile } = useIsMobile();

  return (
    <>
      <Helmet>
        <title>Watch History | YidVid</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-white">
        <div
          className="flex-1 pt-14 transition-all duration-300"
          style={{ paddingLeft: `${sidebarWidth ? sidebarWidth + 16 : 0}px` }}
          className="flex-1 pt-14 transition-all duration-300 pb-20 lg:pb-0"
        >
          <main className="max-w-4xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FFCC00' }}
              >
                <HistoryIcon className="w-5 h-5" style={{ color: '#1A1A1A' }} />
              </div>
              <h1
                className="text-2xl font-bold"
                style={{ fontFamily: "'Quicksand', sans-serif", color: '#1A1A1A' }}
              >
                Watch History
              </h1>
            </div>

            {/* History Content */}
            <VideoHistorySection />
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
}
