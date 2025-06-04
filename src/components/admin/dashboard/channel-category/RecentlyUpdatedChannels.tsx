
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Channel } from "./types";

interface RecentlyUpdatedChannelsProps {
  channels: Channel[];
}

export const RecentlyUpdatedChannels = ({ channels }: RecentlyUpdatedChannelsProps) => {
  if (channels.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-lg">Recently Updated (Last 24h)</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {channels.slice(0, 10).map((channel) => (
            <Badge 
              key={channel.id} 
              variant="outline"
              className="flex items-center gap-1"
            >
              <img
                src={channel.thumbnail_url || '/placeholder.svg'}
                alt=""
                className="w-4 h-4 rounded-full"
              />
              {channel.title.substring(0, 20)}...
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
