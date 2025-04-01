
import { formatDistanceToNow } from "date-fns";

export const useVideoDate = () => {
  // Format the upload date with robust error handling
  const getFormattedDate = (uploadedAt: string | Date) => {
    try {
      if (!uploadedAt) return "recently";
      
      let dateToFormat: Date;
      
      if (typeof uploadedAt === "string") {
        dateToFormat = new Date(uploadedAt);
      } else if (uploadedAt instanceof Date) {
        dateToFormat = uploadedAt;
      } else {
        return "recently"; // Fallback for unexpected types
      }
      
      // Check if the date is valid before formatting
      if (isNaN(dateToFormat.getTime())) {
        console.warn("Invalid date encountered:", uploadedAt);
        return "recently";
      }
      
      return formatDistanceToNow(dateToFormat, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error, uploadedAt);
      return "recently"; // Fallback for all errors
    }
  };

  return { getFormattedDate };
};
