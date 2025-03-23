
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Music } from "lucide-react";

interface TrackInfoProps {
  title: string;
  artistName: string;
  artistThumbnail?: string;
  plays: number;
  uploadedAt: string;
}

export const TrackInfo = ({ title, artistName, artistThumbnail, plays, uploadedAt }: TrackInfoProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={artistThumbnail} />
            <AvatarFallback>
              <div className="flex items-center justify-center w-full h-full">
                <img 
                  src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
                  alt="YidVid Logo" 
                  className="w-6 h-6 object-contain"
                  onError={() => {}} 
                />
              </div>
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{artistName}</h2>
            <p className="text-sm text-gray-500">
              {plays} plays
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Uploaded {formatDistanceToNow(new Date(uploadedAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};
