
import { Youtube, ChevronDown, ChevronUp, UserPlus, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ChannelHeaderProps {
  channel: {
    thumbnail_url: string;
    title: string;
    description?: string;
  };
  isSubscribed: boolean;
  showDescription: boolean;
  onSubscribe: () => void;
  onToggleDescription: () => void;
}

export const ChannelHeader = ({
  channel,
  isSubscribed,
  showDescription,
  onSubscribe,
  onToggleDescription,
}: ChannelHeaderProps) => {
  return (
    <div className="flex flex-col items-center mb-6 md:mb-8">
      <Avatar className="w-20 h-20 md:w-32 md:h-32 mb-3 md:mb-4 opacity-0 animate-[scaleIn_0.6s_ease-out_0.3s_forwards] group">
        <AvatarImage
          src={channel.thumbnail_url}
          alt={channel.title}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <AvatarFallback className="bg-primary/10">
          <Youtube className="w-10 h-10 md:w-16 md:h-16 text-primary" />
        </AvatarFallback>
      </Avatar>
      
      <h1 className="text-xl md:text-3xl font-bold text-center mb-2 opacity-0 animate-[fadeIn_0.6s_ease-out_0.4s_forwards]">
        {channel.title}
      </h1>
      
      <Button
        variant={isSubscribed ? "default" : "outline"}
        onClick={onSubscribe}
        className={`h-8 md:h-10 text-sm md:text-base px-3 md:px-4 mb-3 md:mb-4 transition-all duration-200 ${
          isSubscribed ? "bg-primary hover:bg-primary-hover text-white shadow-md" : ""
        }`}
      >
        {isSubscribed ? (
          <>
            <Check className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 animate-in" />
            Subscribed
          </>
        ) : (
          <>
            <UserPlus className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
            Subscribe
          </>
        )}
      </Button>

      {channel.description && (
        <div className="flex flex-col items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleDescription}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors border-muted-foreground/30 h-6 md:h-7 px-2"
          >
            {showDescription ? (
              <span className="flex items-center gap-1">
                Less <ChevronUp className="h-2.5 w-2.5 md:h-3 md:w-3" />
              </span>
            ) : (
              <span className="flex items-center gap-1">
                More <ChevronDown className="h-2.5 w-2.5 md:h-3 md:w-3" />
              </span>
            )}
          </Button>
          {showDescription && (
            <p className="text-muted-foreground text-xs md:text-sm text-center max-w-2xl mt-2 animate-fade-in">
              {channel.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
