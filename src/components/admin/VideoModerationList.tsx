import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageOff, Check, X, Eye } from "lucide-react";
import { ModerationVideo } from "@/hooks/admin/useVideoModeration";

interface Props {
  title: string;
  videos: ModerationVideo[];
  emptyText: string;
  primaryAction?: {
    label: string;
    onClick: (v: ModerationVideo) => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: (v: ModerationVideo) => void;
    icon?: React.ReactNode;
    variant?: "outline" | "destructive" | "secondary" | "default";
  };
}

export const VideoModerationList: React.FC<Props> = ({ title, videos, emptyText, primaryAction, secondaryAction }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="outline">{videos.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {videos.length === 0 ? (
          <div className="text-sm text-muted-foreground">{emptyText}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((v) => (
              <div key={v.id} className="border rounded-lg p-3 flex gap-3">
                {v.thumbnail ? (
                  <img src={v.thumbnail} alt={v.title} className="h-20 w-32 object-cover rounded" loading="lazy" />
                ) : (
                  <div className="h-20 w-32 flex items-center justify-center bg-muted rounded">
                    <ImageOff className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate" title={v.title}>{v.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{v.channel_name || "Unknown Channel"}</div>
                  <div className="mt-2 flex gap-2">
                    {primaryAction && (
                      <Button size="sm" onClick={() => primaryAction.onClick(v)}>
                        {primaryAction.icon || <Check className="h-4 w-4 mr-1" />} {primaryAction.label}
                      </Button>
                    )}
                    {secondaryAction && (
                      <Button size="sm" variant={secondaryAction.variant || "outline"} onClick={() => secondaryAction.onClick(v)}>
                        {secondaryAction.icon || <X className="h-4 w-4 mr-1" />} {secondaryAction.label}
                      </Button>
                    )}
                    <a href={`/video/${v.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs text-muted-foreground hover:underline ml-auto">
                      <Eye className="h-3 w-3 mr-1" /> View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
