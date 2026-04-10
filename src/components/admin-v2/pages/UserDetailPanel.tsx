import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Pencil, Trash2, X, Save, Loader2, Eye, Play, Tv, Clock, Heart, Activity, Mail, Calendar
} from "lucide-react";
import { formatDate } from "@/components/dashboard/user-management/UserManagementUtils";
import { formatDistanceToNow } from "date-fns";

interface UserDetailPanelProps {
  user: any;
  currentUserId: string;
  onClose: () => void;
  editMode: boolean;
  editDisplayName: string;
  editUsername: string;
  setEditDisplayName: (v: string) => void;
  setEditUsername: (v: string) => void;
  savingEdit: boolean;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onViewActivity: () => void;
  onDeleteUser: () => void;
}

export const UserDetailPanel = ({
  user, currentUserId, onClose, editMode, editDisplayName, editUsername,
  setEditDisplayName, setEditUsername, savingEdit,
  onStartEdit, onSaveEdit, onCancelEdit, onViewActivity, onDeleteUser,
}: UserDetailPanelProps) => {
  // Fetch quick engagement stats for this user
  const { data: quickStats } = useQuery({
    queryKey: ["user-quick-stats", user.id],
    queryFn: async () => {
      const [
        { count: videosWatched },
        { count: subsCount },
        { count: favCount },
        { data: sessions },
      ] = await Promise.all([
        supabase.from("video_history").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("channel_subscriptions").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("user_video_interactions").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("interaction_type", "like"),
        supabase.from("user_analytics").select("session_start, session_end").eq("user_id", user.id).order("session_start", { ascending: false }).limit(200),
      ]);

      // Calc time on site & live status
      let totalMinutes = 0;
      let isLive = false;
      (sessions || []).forEach((s: any) => {
        if (s.session_start && s.session_end) {
          const diff = (new Date(s.session_end).getTime() - new Date(s.session_start).getTime()) / 60000;
          if (diff > 0 && diff < 480) totalMinutes += diff;
        }
        if (s.session_start && !s.session_end) {
          const startAge = (Date.now() - new Date(s.session_start).getTime()) / 60000;
          if (startAge < 480) isLive = true;
        } else if (s.session_end) {
          const endAge = (Date.now() - new Date(s.session_end).getTime()) / 60000;
          if (endAge < 2) isLive = true;
        }
      });

      // Unique channels
      const { data: allHistory } = await supabase.from("video_history").select("video_id").eq("user_id", user.id);
      let uniqueChannels = 0;
      if (allHistory?.length) {
        const vIds = [...new Set(allHistory.map((h: any) => h.video_id))];
        const { data: vids } = await supabase.from("youtube_videos").select("channel_id").in("id", vIds.slice(0, 500));
        uniqueChannels = new Set(vids?.map((v: any) => v.channel_id) || []).size;
      }

      return {
        videosWatched: videosWatched || 0,
        channelsExplored: uniqueChannels,
        subscriptions: subsCount || 0,
        favorites: favCount || 0,
        totalMinutes: Math.round(totalMinutes),
        isLive,
      };
    },
    refetchInterval: 30000,
  });

  const displayName = user.display_name || user.username || user.name || "Unnamed";
  const timeStr = quickStats?.totalMinutes
    ? quickStats.totalMinutes >= 60
      ? `${Math.floor(quickStats.totalMinutes / 60)}h ${quickStats.totalMinutes % 60}m`
      : `${quickStats.totalMinutes}m`
    : "0m";

  return (
    <Card className="bg-[#12131a] border-[#1e2028] w-[40%] min-w-[340px]">
      <CardContent className="p-5">
        {/* Header: Avatar + name + badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#2a2b35] flex items-center justify-center text-lg font-semibold text-gray-300 shrink-0 relative">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" />
              ) : (
                displayName[0]?.toUpperCase()
              )}
              {quickStats?.isLive && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#12131a] animate-pulse" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-100 leading-tight">{displayName}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                {user.is_admin && (
                  <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] px-1.5 py-0">Admin</Badge>
                )}
                {user.id === currentUserId && (
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[9px] px-1.5 py-0">You</Badge>
                )}
                {quickStats?.isLive && (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0">Live</Badge>
                )}
              </div>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-300 h-7 w-7 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Engagement stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: Play, label: "Videos", value: quickStats?.videosWatched || 0, color: "text-violet-400" },
            { icon: Tv, label: "Channels", value: quickStats?.channelsExplored || 0, color: "text-blue-400" },
            { icon: Activity, label: "Subs", value: quickStats?.subscriptions || 0, color: "text-cyan-400" },
            { icon: Heart, label: "Favorites", value: quickStats?.favorites || 0, color: "text-pink-400" },
            { icon: Clock, label: "Time", value: timeStr, color: "text-amber-400" },
            { icon: Eye, label: "Status", value: quickStats?.isLive ? "Live" : "Offline", color: quickStats?.isLive ? "text-emerald-400" : "text-gray-500" },
          ].map(stat => (
            <div key={stat.label} className="bg-[#0f1117] rounded-lg p-2 border border-[#1e2028] text-center">
              <stat.icon className={`w-3.5 h-3.5 mx-auto mb-1 ${stat.color}`} />
              <p className="text-sm font-bold text-white leading-tight">{stat.value}</p>
              <p className="text-[9px] text-[#565b6e]">{stat.label}</p>
            </div>
          ))}
        </div>

        <Separator className="bg-[#1e2028] mb-3" />

        {/* Compact user info */}
        {!editMode ? (
          <div className="space-y-2 mb-3">
            <DetailRow label="User ID" value={user.id} copyable />
            <DetailRow label="Username" value={user.username || "—"} />
            <DetailRow label="Joined" value={user.created_at ? formatDate(user.created_at) : "Unknown"} />
            <DetailRow label="Type" value={(user as any).user_type || "visitor"} />
          </div>
        ) : (
          <div className="space-y-3 mb-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Display Name</label>
              <Input
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                className="bg-[#1a1b24] border-[#2a2b35] text-gray-200 h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Username</label>
              <Input
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="bg-[#1a1b24] border-[#2a2b35] text-gray-200 h-8 text-sm"
              />
            </div>
          </div>
        )}

        <Separator className="bg-[#1e2028] mb-3" />

        {/* Action buttons */}
        {user.id !== currentUserId && (
          <div className="space-y-1.5">
            {!editMode ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-[#2a2b35] text-gray-300 hover:text-gray-100 hover:bg-[#1a1b24] justify-start h-8"
                  onClick={onViewActivity}
                >
                  <Eye className="h-3.5 w-3.5 mr-2" /> View Full Activity
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-[#2a2b35] text-gray-300 hover:text-gray-100 hover:bg-[#1a1b24] justify-start h-8"
                  onClick={onStartEdit}
                >
                  <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Profile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-start h-8"
                  onClick={onDeleteUser}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete User
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-gray-400 hover:text-gray-200"
                  onClick={onCancelEdit}
                  disabled={savingEdit}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={onSaveEdit}
                  disabled={savingEdit}
                >
                  {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-3.5 w-3.5 mr-1" /> Save</>}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DetailRow = ({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) => (
  <div className="flex justify-between items-center group">
    <span className="text-[11px] text-gray-500">{label}</span>
    <div className="flex items-center gap-1">
      <span className={`text-xs text-gray-300 text-right truncate ${copyable ? 'max-w-[140px] font-mono text-[10px]' : 'max-w-[180px]'}`}>{value}</span>
      {copyable && (
        <button
          onClick={() => { navigator.clipboard.writeText(value); import("sonner").then(m => m.toast.success("Copied")); }}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 transition-opacity p-0.5"
          title="Copy"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      )}
    </div>
  </div>
);
