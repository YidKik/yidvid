import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Clock, ExternalLink, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

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
  } | null;
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";

export const ChannelRequestsPageV2 = () => {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-channel-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channel_requests")
        .select(`*, profiles (email, display_name)`)
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

  const filtered = requests?.filter(r => filter === "all" || r.status === filter) || [];
  const counts = {
    all: requests?.length || 0,
    pending: requests?.filter(r => r.status === "pending").length || 0,
    approved: requests?.filter(r => r.status === "approved").length || 0,
    rejected: requests?.filter(r => r.status === "rejected").length || 0,
  };

  const statusBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/15 text-red-400 border-red-500/20 hover:bg-red-500/20"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const filterButtons: { key: FilterStatus; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "approved", label: `Approved (${counts.approved})` },
    { key: "rejected", label: `Rejected (${counts.rejected})` },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Filter tabs */}
      <div className="flex items-center gap-2">
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

      {/* Table */}
      <div className="rounded-xl border border-[#1e2028] bg-[#0f1117] overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-[#1a1c25]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#565b6e]">
            <Search className="w-8 h-8 mb-3 opacity-40" />
            <p className="text-sm">No {filter === "all" ? "" : filter} channel requests found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[#1e2028] hover:bg-transparent">
                <TableHead className="text-[#565b6e] text-[11px] uppercase tracking-wider font-semibold">Channel</TableHead>
                <TableHead className="text-[#565b6e] text-[11px] uppercase tracking-wider font-semibold">Requested By</TableHead>
                <TableHead className="text-[#565b6e] text-[11px] uppercase tracking-wider font-semibold">Date</TableHead>
                <TableHead className="text-[#565b6e] text-[11px] uppercase tracking-wider font-semibold">Status</TableHead>
                <TableHead className="text-[#565b6e] text-[11px] uppercase tracking-wider font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(request => (
                <TableRow key={request.id} className="border-[#1e2028] hover:bg-[#1a1c25]/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#c4c7d4]">{request.channel_name}</span>
                      {request.channel_id && (
                        <a
                          href={`https://youtube.com/channel/${request.channel_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#565b6e] hover:text-[#818cf8] transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#8b8fa3]">
                    {request.profiles?.display_name || request.profiles?.email || "Anonymous"}
                  </TableCell>
                  <TableCell className="text-xs text-[#565b6e]">
                    {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>{statusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    {request.status === "pending" && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(request.id, "approved")}
                          className="h-7 px-3 text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(request.id, "rejected")}
                          className="h-7 px-3 text-xs bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
