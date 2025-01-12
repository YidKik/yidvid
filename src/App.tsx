import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "@/pages/Index";
import VideoDetails from "@/pages/VideoDetails";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";
import ChannelDetails from "@/pages/ChannelDetails";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/video/:id",
    element: <VideoDetails />,
  },
  {
    path: "/channel/:channelId",
    element: <ChannelDetails />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
