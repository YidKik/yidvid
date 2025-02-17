
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
}

export const BackButton = ({ className }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate("/?skipWelcome=true")}
      className={cn(
        "fixed top-20 left-4 p-2 hover:bg-primary/5 transition-all duration-200",
        "rounded-full shadow-sm hover:shadow-md",
        "border border-gray-100 bg-white/95 backdrop-blur-sm",
        "group hover:scale-105 active:scale-95",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 text-primary group-hover:text-primary/80" />
    </Button>
  );
};
