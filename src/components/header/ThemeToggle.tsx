import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export const ThemeToggle = () => {
  const { mode, cycleTheme } = useTheme();

  const Icon = mode === "light" ? Sun : Moon;
  const label = mode === "light" ? "Light" : "Dark";

  return (
    <button
      onClick={cycleTheme}
      title={`Theme: ${label} — Click to change`}
      className={cn(
        "flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200",
        "border-2 hover:scale-105",
        "border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#666666]",
        "dark:border-[#3f3f3f] dark:hover:bg-[#3f3f3f] dark:text-[#aaaaaa]"
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};
