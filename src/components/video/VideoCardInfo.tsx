
import { useIsMobile } from "@/hooks/use-mobile";
import { Clock, Eye } from "lucide-react";

interface VideoCardInfoProps {
  title: string;
  channelName: string;
  channelId?: string;
  views: number;
  formattedDate: string;
  channelThumbnail?: string;
  textColor?: string;
  hideChannelName?: boolean;
}

// Helper function to remove emojis and special icons from text
const removeEmojis = (text: string): string => {
  // Remove emoji characters and other special symbols
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
    .replace(/[\u{231A}-\u{231B}]/gu, '')   // Watch, Hourglass
    .replace(/[\u{23E9}-\u{23F3}]/gu, '')   // Media control symbols
    .replace(/[\u{23F8}-\u{23FA}]/gu, '')   // Media control symbols
    .replace(/[\u{25AA}-\u{25AB}]/gu, '')   // Squares
    .replace(/[\u{25B6}]/gu, '')            // Play button
    .replace(/[\u{25C0}]/gu, '')            // Reverse button
    .replace(/[\u{25FB}-\u{25FE}]/gu, '')   // Squares
    .replace(/[\u{2614}-\u{2615}]/gu, '')   // Umbrella, Hot beverage
    .replace(/[\u{2648}-\u{2653}]/gu, '')   // Zodiac signs
    .replace(/[\u{267F}]/gu, '')            // Wheelchair
    .replace(/[\u{2693}]/gu, '')            // Anchor
    .replace(/[\u{26A1}]/gu, '')            // High voltage
    .replace(/[\u{26AA}-\u{26AB}]/gu, '')   // Circles
    .replace(/[\u{26BD}-\u{26BE}]/gu, '')   // Sports balls
    .replace(/[\u{26C4}-\u{26C5}]/gu, '')   // Snowman, Sun
    .replace(/[\u{26CE}]/gu, '')            // Ophiuchus
    .replace(/[\u{26D4}]/gu, '')            // No entry
    .replace(/[\u{26EA}]/gu, '')            // Church
    .replace(/[\u{26F2}-\u{26F3}]/gu, '')   // Fountain, Golf
    .replace(/[\u{26F5}]/gu, '')            // Sailboat
    .replace(/[\u{26FA}]/gu, '')            // Tent
    .replace(/[\u{26FD}]/gu, '')            // Fuel pump
    .replace(/[\u{2702}]/gu, '')            // Scissors
    .replace(/[\u{2705}]/gu, '')            // Check mark
    .replace(/[\u{2708}-\u{270D}]/gu, '')   // Airplane to Writing hand
    .replace(/[\u{270F}]/gu, '')            // Pencil
    .replace(/[\u{2712}]/gu, '')            // Black nib
    .replace(/[\u{2714}]/gu, '')            // Check mark
    .replace(/[\u{2716}]/gu, '')            // X mark
    .replace(/[\u{271D}]/gu, '')            // Latin cross
    .replace(/[\u{2721}]/gu, '')            // Star of David
    .replace(/[\u{2728}]/gu, '')            // Sparkles
    .replace(/[\u{2733}-\u{2734}]/gu, '')   // Eight spoked asterisk
    .replace(/[\u{2744}]/gu, '')            // Snowflake
    .replace(/[\u{2747}]/gu, '')            // Sparkle
    .replace(/[\u{274C}]/gu, '')            // Cross mark
    .replace(/[\u{274E}]/gu, '')            // Cross mark
    .replace(/[\u{2753}-\u{2755}]/gu, '')   // Question marks
    .replace(/[\u{2757}]/gu, '')            // Exclamation mark
    .replace(/[\u{2763}-\u{2764}]/gu, '')   // Heart exclamation, Heart
    .replace(/[\u{2795}-\u{2797}]/gu, '')   // Plus, Minus, Division
    .replace(/[\u{27A1}]/gu, '')            // Right arrow
    .replace(/[\u{27B0}]/gu, '')            // Curly loop
    .replace(/[\u{27BF}]/gu, '')            // Double curly loop
    .replace(/[\u{2934}-\u{2935}]/gu, '')   // Arrows
    .replace(/[\u{2B05}-\u{2B07}]/gu, '')   // Arrows
    .replace(/[\u{2B1B}-\u{2B1C}]/gu, '')   // Squares
    .replace(/[\u{2B50}]/gu, '')            // Star
    .replace(/[\u{2B55}]/gu, '')            // Circle
    .replace(/[\u{3030}]/gu, '')            // Wavy dash
    .replace(/[\u{303D}]/gu, '')            // Part alternation mark
    .replace(/[\u{3297}]/gu, '')            // Circled Ideograph Congratulation
    .replace(/[\u{3299}]/gu, '')            // Circled Ideograph Secret
    .replace(/\s+/g, ' ')                   // Normalize whitespace
    .trim();
};

export const VideoCardInfo = ({
  title,
  channelName,
  channelId,
  views,
  formattedDate,
  channelThumbnail,
  textColor = "text-black",
  hideChannelName = false
}: VideoCardInfoProps) => {
  const { isMobile } = useIsMobile();
  
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    } else {
      return count.toString();
    }
  };

  const cleanTitle = removeEmojis(title);

  return (
    <div className="mt-2 xl:mt-3 px-1">
      <h3 
        className="text-[12px] xl:text-sm font-bold line-clamp-2 text-foreground leading-snug"
        style={{ fontFamily: "'Quicksand', 'Rubik', 'Varela Round', sans-serif" }}
        title={cleanTitle}
      >
        {cleanTitle}
      </h3>
      
      <div 
        className="flex items-center gap-2 xl:gap-3 mt-1 xl:mt-1.5 text-muted-foreground"
        style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
      >
        <div className="flex items-center gap-1 text-[10px] xl:text-xs">
          <Clock size={10} className="text-muted-foreground xl:w-3 xl:h-3" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] xl:text-xs">
          <Eye size={10} className="text-muted-foreground xl:w-3 xl:h-3" />
          <span>{formatViewCount(views)}</span>
        </div>
      </div>
    </div>
  );
};
