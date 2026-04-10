import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow, differenceInHours, differenceInDays, differenceInMinutes } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search, Mail, Send, Loader2, X, Clock, Hash, User,
  CheckCircle, AlertCircle, Eye, Copy, ArrowUpDown, Timer
} from "lucide-react";

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  status: string;
  created_at: string;
  admin_reply: string | null;
  replied_by: string | null;
  replied_at: string | null;
  user_id: string | null;
}

const STATUS_CONFIG: Record<string, {
  label: string;
  bg: string;
  selectedBg: string;
  border: string;
  accent: string;
  text: string;
  icon: typeof CheckCircle;
}> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-600/80",
    selectedBg: "bg-amber-600",
    border: "border-amber-400",
    accent: "text-amber-100",
    text: "text-white",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-sky-600/80",
    selectedBg: "bg-sky-600",
    border: "border-sky-400",
    accent: "text-sky-100",
    text: "text-white",
    icon: AlertCircle,
  },
  resolved: {
    label: "Resolved",
    bg: "bg-emerald-600/80",
    selectedBg: "bg-emerald-600",
    border: "border-emerald-400",
    accent: "text-emerald-100",
    text: "text-white",
    icon: CheckCircle,
  },
  closed: {
    label: "Closed",
    bg: "bg-slate-600/80",
    selectedBg: "bg-slate-600",
    border: "border-slate-400",
    accent: "text-slate-200",
    text: "text-white",
    icon: X,
  },
};

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  bug_report: { label: "Bug Report", color: "bg-white/20 text-white border-white/30" },
  feature_request: { label: "Feature Request", color: "bg-white/20 text-white border-white/30" },
  support: { label: "Support", color: "bg-white/20 text-white border-white/30" },
  general: { label: "General", color: "bg-white/20 text-white border-white/30" },
};

type SortOption = "newest" | "oldest" | "longest_open";

const getOpenDuration = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const mins = differenceInMinutes(now, created);
  const hours = differenceInHours(now, created);
  const days = differenceInDays(now, created);
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mo`;
};

const getOpenDurationFull = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const mins = differenceInMinutes(now, created);
  const hours = differenceInHours(now, created);
  const days = differenceInDays(now, created);
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""}`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""}`;
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? "s" : ""}`;
};

export const ContactRequestsPageV2 = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-v2-contact-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContactRequest[];
    },
    retry: 2,
    staleTime: 15000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-v2-contact-requests"] });

  const filtered = useMemo(() => {
    if (!requests) return [];
    let result = [...requests];
    if (statusFilter !== "all") {
      result = result.filter(r => r.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.message?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      if (sortBy === "oldest" || sortBy === "longest_open") return dateA - dateB;
      return dateB - dateA;
    });
    return result;
  }, [requests, searchQuery, statusFilter, sortBy]);

  const selected = useMemo(
    () => requests?.find(r => r.id === selectedId) || null,
    [requests, selectedId]
  );

  const counts = useMemo(() => {
    if (!requests) return { all: 0, pending: 0, in_progress: 0, resolved: 0, closed: 0 };
    return {
      all: requests.length,
      pending: requests.filter(r => r.status === "pending").length,
      in_progress: requests.filter(r => r.status === "in_progress").length,
      resolved: requests.filter(r => r.status === "resolved").length,
      closed: requests.filter(r => r.status === "closed").length,
    };
  }, [requests]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error, count } = await supabase
        .from("contact_requests")
        .update({ status: newStatus })
        .eq("id", id)
        .select();
      if (error) {
        console.error("Contact request update error:", error);
        toast.error(`Failed to update status: ${error.message}`);
      } else {
        toast.success(`Status changed to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
        await invalidate();
      }
    } catch (err: any) {
      console.error("Contact request update exception:", err);
      toast.error(`Failed to update status: ${err?.message || "Unknown error"}`);
    }
  };

  const sendReply = async () => {
    if (!selected || !replyText.trim()) return;
    setIsReplying(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("contact_requests")
        .update({
          admin_reply: replyText,
          replied_by: user.user?.id,
          replied_at: new Date().toISOString(),
          status: "resolved",
        })
        .eq("id", selected.id);
      if (error) throw error;

      await supabase.functions.invoke("send-contact-notifications", {
        body: { type: "admin_reply", requestId: selected.id, adminReply: replyText },
      }).catch(() => {});

      toast.success("Reply sent successfully");
      setReplyText("");
      await invalidate();
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setIsReplying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const cycleSortOption = () => {
    const options: SortOption[] = ["newest", "oldest", "longest_open"];
    const idx = options.indexOf(sortBy);
    setSortBy(options[(idx + 1) % options.length]);
  };

  const sortLabel: Record<SortOption, string> = {
    newest: "Newest first",
    oldest: "Oldest first",
    longest_open: "Longest open",
  };

  const DetailRow = ({ label, value, icon: Icon, mono, copyable }: {
    label: string; value: string; icon?: any; mono?: boolean; copyable?: boolean;
  }) => (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="w-4 h-4 mt-0.5 text-gray-500 shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <div className="flex items-center gap-2">
          <p className={`text-sm text-gray-200 break-all ${mono ? "font-mono text-xs" : ""}`}>{value || "—"}</p>
          {copyable && value && (
            <button onClick={() => copyToClipboard(value)} className="text-gray-500 hover:text-gray-300 shrink-0">
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)]">
      {/* Left: List */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search by name, email, message, or ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1b23] border-white/10 text-gray-200 placeholder:text-gray-500"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={cycleSortOption}
              className="bg-[#1a1b23] border-white/10 text-gray-400 hover:text-white hover:bg-white/10 shrink-0 h-10 px-3"
            >
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
              <span className="text-xs">{sortLabel[sortBy]}</span>
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "pending", "in_progress", "resolved", "closed"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-white/15 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {s === "all" ? "All" : STATUS_CONFIG[s]?.label || s} ({counts[s as keyof typeof counts]})
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-2">
            {filtered.map(request => {
              const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
              const category = CATEGORY_CONFIG[request.category] || CATEGORY_CONFIG.general;
              const isSelected = selectedId === request.id;
              const StatusIcon = status.icon;
              const openDuration = getOpenDuration(request.created_at);
              const isOpen = request.status === "pending" || request.status === "in_progress";

              return (
                <Card
                  key={request.id}
                  className={`cursor-pointer transition-all rounded-xl border-2 shadow-lg ${
                    isSelected ? `${status.selectedBg} ${status.border} ring-2 ring-white/20` : `${status.bg} ${status.border} hover:brightness-110 hover:shadow-xl`
                  }`}
                  onClick={() => setSelectedId(request.id)}
                >
                  <CardContent className="p-4">
                    {/* Top row: status + duration */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${status.text} drop-shadow`} />
                        <span className={`text-xs font-bold uppercase tracking-wide ${status.text} drop-shadow`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/20 rounded-full px-2.5 py-0.5">
                        <Timer className="w-3 h-3 text-white/80" />
                        <span className="text-[11px] font-mono font-semibold text-white/90">
                          {isOpen ? `Open ${openDuration}` : openDuration}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-3.5 h-3.5 text-white/70 shrink-0" />
                          <p className={`text-sm font-bold ${status.text} truncate drop-shadow`}>{request.name}</p>
                          {request.admin_reply && (
                            <CheckCircle className="w-3.5 h-3.5 text-white shrink-0 drop-shadow" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Mail className="w-3 h-3 text-white/60 shrink-0" />
                          <p className="text-xs text-white/70 truncate">{request.email}</p>
                        </div>
                        <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">{request.message}</p>
                      </div>
                      <Badge className={`${category.color} border text-[10px] px-2 py-0.5 shrink-0 font-semibold`}>
                        {category.label}
                      </Badge>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/15">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-white/50" />
                        <p className="text-[10px] text-white/60">
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {request.admin_reply && (
                        <span className="text-[10px] text-white/60 bg-white/10 rounded px-1.5 py-0.5">Replied</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <Mail className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                <p className="text-sm text-gray-500">No contact requests found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Detail panel */}
      <div className="w-[420px] shrink-0">
        {selected ? (() => {
          const selStatus = STATUS_CONFIG[selected.status] || STATUS_CONFIG.pending;
          const selCategory = CATEGORY_CONFIG[selected.category] || CATEGORY_CONFIG.general;
          const isOpen = selected.status === "pending" || selected.status === "in_progress";

          return (
            <Card className="bg-[#1a1b23] border-white/10 h-full flex flex-col">
              <CardContent className="p-5 flex-1 overflow-auto">
                {/* Header with status color bar */}
                <div className={`-mx-5 -mt-5 px-5 py-4 mb-4 rounded-t-lg ${selStatus.bg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <selStatus.icon className="w-5 h-5 text-white drop-shadow" />
                      <h3 className="text-lg font-bold text-white drop-shadow">{selected.name}</h3>
                    </div>
                    <button onClick={() => setSelectedId(null)} className="text-white/70 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Timer className="w-3.5 h-3.5 text-white/80" />
                    <span className="text-sm font-medium text-white/90">
                      {isOpen
                        ? `Open for ${getOpenDurationFull(selected.created_at)}`
                        : `Closed after ${getOpenDurationFull(selected.created_at)}`
                      }
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <Badge className={`${selCategory.color.replace('text-white', 'text-gray-300').replace('bg-white/20', 'bg-white/10')} border`}>
                    {selCategory.label}
                  </Badge>
                </div>

                <Separator className="bg-white/5 mb-4" />

                <div className="space-y-1">
                  <DetailRow label="Request ID" value={selected.id} icon={Hash} mono copyable />
                  <DetailRow label="Email" value={selected.email} icon={Mail} copyable />
                  <DetailRow label="Submitted" value={format(new Date(selected.created_at), "MMM d, yyyy 'at' h:mm a")} icon={Clock} />
                  {selected.user_id && (
                    <DetailRow label="User ID" value={selected.user_id} icon={User} mono copyable />
                  )}
                </div>

                <Separator className="bg-white/5 my-4" />

                <div>
                  <p className="text-xs text-gray-500 mb-2">Message</p>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{selected.message}</p>
                  </div>
                </div>

                {selected.admin_reply && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Admin Reply</p>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{selected.admin_reply}</p>
                      {selected.replied_at && (
                        <p className="text-[10px] text-gray-500 mt-2">
                          Replied {formatDistanceToNow(new Date(selected.replied_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <Separator className="bg-white/5 my-4" />

                {/* Status buttons */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                      const isActive = selected.status === key;
                      return (
                        <button
                          key={key}
                          onClick={() => updateStatus(selected.id, key)}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                            isActive
                              ? `${cfg.bg} text-white ring-2 ring-white/30 shadow-lg`
                              : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <cfg.icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator className="bg-white/5 my-4" />

                <div>
                  <p className="text-xs text-gray-500 mb-2">
                    {selected.admin_reply ? "Send New Reply" : "Send Reply"}
                  </p>
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows={4}
                    className="bg-white/5 border-white/10 text-gray-200 placeholder:text-gray-600 mb-2"
                  />
                  <Button
                    onClick={sendReply}
                    disabled={!replyText.trim() || isReplying}
                    size="sm"
                    className="w-full"
                  >
                    {isReplying ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })() : (
          <Card className="bg-[#1a1b23] border-white/5 h-full flex items-center justify-center">
            <div className="text-center">
              <Eye className="w-10 h-10 mx-auto mb-3 text-gray-600" />
              <p className="text-sm text-gray-500">Select a request to view details</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
