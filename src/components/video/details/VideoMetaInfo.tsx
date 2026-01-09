import { Eye, Calendar } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface VideoMetaInfoProps {
  views: number;
  uploadedAt: string | Date;
  showIcon?: boolean;
}

export const VideoMetaInfo = ({ views, uploadedAt, showIcon = false }: VideoMetaInfoProps) => {
  const getFormattedDate = () => {
    try {
      if (!uploadedAt) return "recently";
      
      let dateToFormat: Date;
      
      if (typeof uploadedAt === "string") {
        dateToFormat = new Date(uploadedAt);
      } else if (uploadedAt instanceof Date) {
        dateToFormat = uploadedAt;
      } else {
        return "recently";
      }
      
      if (isNaN(dateToFormat.getTime())) {
        return "recently";
      }
      
      return format(dateToFormat, "MMM d, yyyy");
    } catch (error) {
      return "recently";
    }
  };

  const formattedDate = getFormattedDate();
  const formattedViews = views?.toLocaleString() || "0";

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="flex items-center gap-1.5 font-medium">
        <Eye className="h-4 w-4" />
        {formattedViews}
      </span>
      <span className="w-1 h-1 bg-muted-foreground/60 rounded-full"></span>
      <span className="font-medium">{formattedDate}</span>
    </div>
  );
};
