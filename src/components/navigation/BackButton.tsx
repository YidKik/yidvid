import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate("/")}
      className="fixed top-20 left-4 rounded-full border border-foreground/20 hover:bg-accent/10 z-10"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
};