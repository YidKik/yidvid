
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";
import { RecentChange } from "./types";

interface RecentChangesProps {
  recentChanges: RecentChange[];
  onUndoChange: (change: RecentChange) => void;
  isUpdating: boolean;
}

export const RecentChanges = ({ recentChanges, onUndoChange, isUpdating }: RecentChangesProps) => {
  if (recentChanges.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Undo2 className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Recent Changes</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {recentChanges.map((change) => (
            <div key={change.id} className="flex items-center justify-between p-2 bg-muted rounded border border-border">
              <div className="text-sm">
                <span className="font-medium">{change.channel_title}</span>
                <span className="text-gray-500 mx-2">→</span>
                <span className="text-blue-600">{change.new_category}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUndoChange(change)}
                disabled={isUpdating}
                className="h-7 px-2"
              >
                <Undo2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
