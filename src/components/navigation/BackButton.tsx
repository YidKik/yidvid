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
      onClick={() => navigate("/")}
      className={cn("fixed top-20 left-4 rounded-full border border-foreground/20 hover:bg-accent/10 z-10", className)}
    >
      <ArrowLeft className="h-5 w-5 text-red-500" />
    </Button>
  );
};