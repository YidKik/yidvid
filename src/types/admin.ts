
import { YoutubeVideosTable } from "@/integrations/supabase/types/youtube-videos";

export type TimeRange = "24h" | "7d" | "30d" | "all";

export const timeRanges = {
  "24h": { days: 1, label: "Last 24 hours" },
  "7d": { days: 7, label: "Last 7 days" },
  "30d": { days: 30, label: "Last 30 days" },
  "all": { days: 0, label: "All time" }
} as const;

export type VideoTableProps = {
  videos: YoutubeVideosTable["Row"][] | null;
  isDeleting: boolean;
  onDeleteVideo: (videoId: string) => void;
};

export type TimeRangeSelectProps = {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
};
