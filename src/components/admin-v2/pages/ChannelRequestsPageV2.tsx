import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Clock, ExternalLink, Search, User, Mail, Hash, Copy, X, Calendar, Link2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChannelRequest {
  id: string;
  channel_name: string;
  channel_id: string | null;
  user_id: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    email: string;
    display_name: string | null;
    username: string | null;
  } | null;
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";

export const ChannelRequestsPageV2 = () => {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-channel-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channel_requests")
        .select(`*, profiles (email, display_name, username)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as ChannelRequest[];
    },
  });

  const handleStatusChange = async (requestId: string, newStatus: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("channel_requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) throw error;
      toast.success(`Request ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["admin-channel-requests"] });
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Failed to update request");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const filtered = requests?.filter(r => filter === "all" || r.status === filter) || [];
  const selected = requests?.find(r => r.id === selectedId) || null;

  const counts = {
    all: requests?.length || 0,
    pending: requests?.filter(r => r.status === "pending").length || 0,
    approved: requests?.filter(r => r.status === "approved").length || 0,
    rejected: requests?.filter(r => r.status === "rejected").length || 0,
  };

  const statusBadge = (status: string | null, size: "sm" | "lg" = "sm") => {
    const cls = size === "lg" ? "text-xs px-3 py-1" : "";
    switch (status) {
      case "approved":
        return <Badge className={`bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 ${cls}`}><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className={`bg-red-500/15 text-red-400 border-red-500/20 hover:bg-red-500/20 ${cls}`}><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className={`bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 ${cls}`}><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const filterButtons: { key: FilterStatus; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "approved", label: `Approved (${counts.approved})` },
    { key: "rejected", label: `Rejected (${counts.rejected})` },
  ];

  return (
    <div className="flex gap-6 h-[calc(100vh-132px)]">
      {/* Left: list */}
      <div className="flex flex-col min-w-0 flex-1">
        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-4 shrink-0">
          {filterButtons.map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === btn.key
                  ? "bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/20"
                  : "text-[#8b8fa3] hover:bg-[#1a1c25] hover:text-[#c4c7d4] border border-transparent"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Request list */}
        <div className="rounded-xl border border-[#1e2028] bg-[#0f1117] overflow-hidden flex-1 min-h-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full bg-[#1a1c25] rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#565b6e]">
              <Search className="w-8 h-8 mb-3 opacity-40" />
              <p className="text-sm">No {filter === "all" ? "" : filter} channel requests found</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-2 divide-y divide-[#1e2028]">
                {filtered.map(request => {
                  const isActive = selectedId === request.id;
                  return (
                    <button
                      key={request.id}
                      onClick={() => setSelectedId(isActive ? null : request.id)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-all ${
                        isActive
                          ? "bg-[#6366f1]/10 border border-[#6366f1]/20"
                          : "hover:bg-[#1a1c25] border border-transparent"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#c4c7d4] truncate">{request.channel_name}</p>
                        <p className="text-xs text-[#565b6e] mt-0.5 truncate">
                          {request.profiles?.username || request.profiles?.display_name || request.profiles?.email || "Anonymous"}
                          {" · "}
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {statusBadge(request.status)}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Right: detail panel — always visible */}
      <div className="w-[400px] shrink-0 rounded-xl border border-[#1e2028] bg-[#0f1117] flex flex-col overflow-hidden">
        {selected ? (
          <>
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2028] shrink-0">
              <h3 className="text-sm font-semibold text-white truncate pr-3">Request Details</h3>
              <button
                onClick={() => setSelectedId(null)}
                className="p-1 rounded hover:bg-white/5 text-[#565b6e] hover:text-[#8b8fa3] transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-5 space-y-6">
                {/* Channel info */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#565b6e] font-semibold mb-3">Channel</p>
                  <div className="space-y-2.5">
                    <div className="bg-[#13141b] rounded-lg p-3.5 border border-[#1e2028]">
                      <p className="text-[10px] text-[#565b6e] mb-1">Channel Name</p>
                      <p className="text-sm font-medium text-[#c4c7d4]">{selected.channel_name}</p>
                    </div>
                    {selected.channel_id && (
                      <div className="bg-[#13141b] rounded-lg p-3.5 border border-[#1e2028]">
                        <p className="text-[10px] text-[#565b6e] mb-1">Channel ID</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-[#8b8fa3] font-mono truncate flex-1">{selected.channel_id}</p>
                          <button onClick={() => copyToClipboard(selected.channel_id!, "Channel ID")} className="text-[#565b6e] hover:text-[#818cf8] transition-colors shrink-0">
                            <Copy className="w-3 h-3" />
                          </button>
                          <a href={`https://youtube.com/channel/${selected.channel_id}`} target="_blank" rel="noopener noreferrer" className="text-[#565b6e] hover:text-[#818cf8] transition-colors shrink-0">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#565b6e] font-semibold mb-3">Status</p>
                  <div className="bg-[#13141b] rounded-lg p-3.5 border border-[#1e2028] flex items-center justify-between">
                    {statusBadge(selected.status, "lg")}
                    <p className="text-[10px] text-[#565b6e]">
                      Updated {formatDistanceToNow(new Date(selected.updated_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* User details */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#565b6e] font-semibold mb-3">Requested By</p>
                  <div className="space-y-2.5">
                    <InfoRow icon={User} label="Username" value={selected.profiles?.username || selected.profiles?.display_name || "N/A"} />
                    <InfoRow icon={Mail} label="Email" value={selected.profiles?.email || "N/A"} copyable={!!selected.profiles?.email} onCopy={() => copyToClipboard(selected.profiles!.email, "Email")} />
                    <InfoRow icon={Hash} label="User ID" value={selected.user_id || "Anonymous"} mono copyable={!!selected.user_id} onCopy={() => copyToClipboard(selected.user_id!, "User ID")} />
                    <InfoRow icon={Calendar} label="Submitted" value={format(new Date(selected.created_at), "MMM d, yyyy 'at' h:mm a")} />
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#565b6e] font-semibold mb-3">Actions</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={selected.status === "approved"}
                      onClick={() => handleStatusChange(selected.id, "approved")}
                      className="flex-1 h-9 text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 disabled:opacity-30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      disabled={selected.status === "rejected"}
                      onClick={() => handleStatusChange(selected.id, "rejected")}
                      className="flex-1 h-9 text-xs bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 disabled:opacity-30"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#565b6e] px-6">
            <div className="w-12 h-12 rounded-xl bg-[#1a1c25] flex items-center justify-center mb-4">
              <Search className="w-5 h-5 opacity-50" />
            </div>
            <p className="text-sm font-medium text-[#8b8fa3] mb-1">No request selected</p>
            <p className="text-xs text-center">Select a channel request from the list to view its details</p>
          </div>
        )}
      </div>
    </div>
  );
};

function InfoRow({ icon: Icon, label, value, mono, copyable, onCopy }: {
  icon: typeof User;
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 bg-[#13141b] rounded-lg p-3.5 border border-[#1e2028]">
      <Icon className="w-4 h-4 text-[#818cf8] mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-[#565b6e] mb-0.5">{label}</p>
        <div className="flex items-center gap-1.5">
          <p className={`text-sm truncate ${mono ? "font-mono text-xs text-[#8b8fa3]" : "text-[#c4c7d4]"}`}>
            {value}
          </p>
          {copyable && onCopy && (
            <button onClick={onCopy} className="text-[#565b6e] hover:text-[#818cf8] transition-colors shrink-0">
              <Copy className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
