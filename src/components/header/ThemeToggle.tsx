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
      aria-label={`Theme: ${label}. Change theme`}
      onClick={cycleTheme}
      title={`Theme: ${label} — Click to change`}
      className={cn(
        "flex items-center justify-center rounded-control transition-all duration-200",
        "border-2 hover:scale-105",
        "border-border hover:bg-surface-hover text-muted-foreground",
        "dark:border-border dark:hover:bg-secondary dark:text-muted-foreground",
        isMobile ? "w-11 h-11" : "w-9 h-9"
      )}
    >
      <Icon className={"w-4 h-4"} />
    </button>
  );
};
