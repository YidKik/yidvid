
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import CategoryVideos from "@/pages/CategoryVideos";
import VideoDetails from "@/pages/VideoDetails";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Search from "@/pages/Search";
import MusicDetails from "@/pages/MusicDetails";
import ChannelDetails from "@/pages/ChannelDetails";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import VideosPage from "@/pages/admin/VideosPage";
import ChannelsPage from "@/pages/admin/ChannelsPage";
import UsersPage from "@/pages/admin/UsersPage";
import CommentsPage from "@/pages/admin/CommentsPage";
import CategoriesPage from "@/pages/admin/CategoriesPage";
import RequestsPage from "@/pages/admin/RequestsPage";
import ContactRequestsPage from "@/pages/admin/ContactRequestsPage";
import ReportedVideosPage from "@/pages/admin/ReportedVideosPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/category/:id" element={<CategoryVideos />} />
      <Route path="/video/:id" element={<VideoDetails />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/search" element={<Search />} />
      <Route path="/music/:id" element={<MusicDetails />} />
      <Route path="/channel/:id" element={<ChannelDetails />} />
      
      {/* Admin routes */}
      <Route path="/admin/analytics" element={<AnalyticsPage />} />
      <Route path="/admin/videos" element={<VideosPage />} />
      <Route path="/admin/channels" element={<ChannelsPage />} />
      <Route path="/admin/users" element={<UsersPage />} />
      <Route path="/admin/comments" element={<CommentsPage />} />
      <Route path="/admin/categories" element={<CategoriesPage />} />
      <Route path="/admin/requests" element={<RequestsPage />} />
      <Route path="/admin/contact-requests" element={<ContactRequestsPage />} />
      <Route path="/admin/reported-videos" element={<ReportedVideosPage />} />
    </Routes>
  );
}

export default App;
