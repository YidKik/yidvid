import { VideoCard } from "./VideoCard";

const MOCK_VIDEOS = [
  {
    id: "1",
    title: "Understanding the Weekly Torah Portion - Bereishit",
    thumbnail: "https://i.ytimg.com/vi/1234/maxresdefault.jpg",
    channelName: "Rabbi David's Torah Insights",
    views: 15000,
    uploadedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "The Meaning Behind Shabbat Customs",
    thumbnail: "https://i.ytimg.com/vi/5678/maxresdefault.jpg",
    channelName: "Jewish Traditions",
    views: 25000,
    uploadedAt: new Date("2024-01-14"),
  },
  {
    id: "3",
    title: "Jewish Cooking: Perfect Challah Recipe",
    thumbnail: "https://i.ytimg.com/vi/91011/maxresdefault.jpg",
    channelName: "Kosher Kitchen",
    views: 50000,
    uploadedAt: new Date("2024-01-13"),
  },
  {
    id: "4",
    title: "Understanding the High Holidays",
    thumbnail: "https://i.ytimg.com/vi/1213/maxresdefault.jpg",
    channelName: "Jewish Learning Channel",
    views: 35000,
    uploadedAt: new Date("2024-01-12"),
  },
  {
    id: "5",
    title: "Modern Jewish Music Compilation",
    thumbnail: "https://i.ytimg.com/vi/1415/maxresdefault.jpg",
    channelName: "Jewish Music Today",
    views: 45000,
    uploadedAt: new Date("2024-01-11"),
  },
  {
    id: "6",
    title: "Daily Talmud Study - Daf Yomi",
    thumbnail: "https://i.ytimg.com/vi/1617/maxresdefault.jpg",
    channelName: "Talmud Daily",
    views: 20000,
    uploadedAt: new Date("2024-01-10"),
  },
];

export const VideoGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {MOCK_VIDEOS.map((video) => (
        <VideoCard key={video.id} {...video} />
      ))}
    </div>
  );
};