import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const ThemeToggle = () => {
  const { mode, cycleTheme } = useTheme();
  const { isMobile } = useIsMobile();

  const Icon = mode === "light" ? Sun : Moon;
  const label = mode === "light" ? "Light" : "Dark";

  return (
    <button
      onClick={cycleTheme}
      title={`Theme: ${label} — Click to change`}
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-200",
        "border-2 hover:scale-105",
        "border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#666666]",
        "dark:border-[#3f3f3f] dark:hover:bg-[#3f3f3f] dark:text-[#aaaaaa]",
        isMobile ? "w-7 h-7" : "w-9 h-9"
      )}
    >
      <Icon className={isMobile ? "w-3.5 h-3.5" : "w-4 h-4"} />
    </button>
  );
};
