
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Youtube } from "lucide-react";

interface ChannelAvatarProps {
  thumbnailUrl: string | null;
  title: string;
}

export const ChannelAvatar = ({ thumbnailUrl, title }: ChannelAvatarProps) => {
  return (
    <Avatar className="w-12 h-12 rounded-full object-cover flex-shrink-0">
      <AvatarImage 
        src={thumbnailUrl || '/placeholder.svg'} 
        alt={title}
      />
      <AvatarFallback>
        <Youtube className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  );
};
