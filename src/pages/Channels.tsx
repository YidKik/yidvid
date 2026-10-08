import { Helmet } from "react-helmet";
import { ChannelsGrid } from "@/components/youtube/ChannelsGrid";

/** Channel directory: reuses the existing channels grid and data. */
const Channels = () => (
  <>
    <Helmet>
      <title>Channels | YidVid</title>
      <meta name="description" content="Browse all YidVid channels." />
    </Helmet>
    <main className="min-h-screen bg-background pt-16 lg:pl-[var(--sidebar-w)] pb-nav lg:pb-8">
      <h1 className="sr-only">Channels</h1>
      <div className="py-6">
        <ChannelsGrid />
      </div>
    </main>
  </>
);

export default Channels;
