import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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

const STATUS_CONFIG: Record<string, { label: string; cardBg: string; cardBorder: string; badgeColor: string; textColor: string; icon: typeof CheckCircle }> = {
  pending: {
    label: "Pending",
    cardBg: "bg-yellow-500/10",
    cardBorder: "border-yellow-500/30",
    badgeColor: "bg-yellow-500/30 text-yellow-300 border-yellow-500/40",
    textColor: "text-yellow-300",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    cardBg: "bg-blue-500/10",
    cardBorder: "border-blue-500/30",
    badgeColor: "bg-blue-500/30 text-blue-300 border-blue-500/40",
    textColor: "text-blue-300",
    icon: AlertCircle,
  },
  resolved: {
    label: "Resolved",
    cardBg: "bg-green-500/10",
    cardBorder: "border-green-500/30",
    badgeColor: "bg-green-500/30 text-green-300 border-green-500/40",
    textColor: "text-green-300",
    icon: CheckCircle,
  },
  closed: {
    label: "Closed",
    cardBg: "bg-gray-500/10",
    cardBorder: "border-gray-500/30",
    badgeColor: "bg-gray-500/30 text-gray-300 border-gray-500/40",
    textColor: "text-gray-400",
    icon: X,
  },
};

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  bug_report: { label: "Bug Report", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  feature_request: { label: "Feature Request", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  support: { label: "Support", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  general: { label: "General", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
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

  const { data: requests, refetch, isLoading } = useQuery({
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

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      switch (sortBy) {
        case "oldest": return dateA - dateB;
        case "longest_open": return dateA - dateB; // oldest first = longest open
        case "newest":
        default: return dateB - dateA;
      }
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
    const { error } = await supabase
      .from("contact_requests")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      refetch();
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
      refetch();
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
        {/* Search + sort */}
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

        {/* List */}
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
                  className={`cursor-pointer transition-all border-l-4 ${status.cardBorder} ${
                    isSelected
                      ? `${status.cardBg} border border-l-4 ${status.cardBorder}`
                      : `${status.cardBg} hover:brightness-125`
                  }`}
                  onClick={() => setSelectedId(request.id)}
                >
                  <CardContent className="p-4">
                    {/* Open duration banner */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <StatusIcon className={`w-3.5 h-3.5 ${status.textColor}`} />
                        <span className={`text-xs font-semibold ${status.textColor}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className={`w-3 h-3 ${isOpen ? "text-orange-400" : "text-gray-500"}`} />
                        <span className={`text-[11px] font-mono font-medium ${isOpen ? "text-orange-400" : "text-gray-500"}`}>
                          {isOpen ? `Open ${openDuration}` : `Closed after ${openDuration}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-200 truncate">{request.name}</p>
                          {request.admin_reply && (
                            <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mb-2">{request.email}</p>
                        <p className="text-xs text-gray-400 line-clamp-2">{request.message}</p>
                      </div>
                      <div className="shrink-0">
                        <Badge className={`${category.color} border text-[10px] px-1.5 py-0`}>
                          {category.label}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2">
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </p>
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
            <Card className={`${selStatus.cardBg} ${selStatus.cardBorder} border h-full flex flex-col`}>
              <CardContent className="p-5 flex-1 overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{selected.name}</h3>
                  <button onClick={() => setSelectedId(null)} className="text-gray-500 hover:text-gray-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Open duration highlight */}
                <div className={`flex items-center gap-2 rounded-lg px-3 py-2 mb-4 ${
                  isOpen ? "bg-orange-500/10 border border-orange-500/20" : "bg-white/5 border border-white/5"
                }`}>
                  <Timer className={`w-4 h-4 ${isOpen ? "text-orange-400" : "text-gray-500"}`} />
                  <span className={`text-sm font-medium ${isOpen ? "text-orange-300" : "text-gray-400"}`}>
                    {isOpen
                      ? `Open for ${getOpenDurationFull(selected.created_at)}`
                      : `Closed after ${getOpenDurationFull(selected.created_at)}`
                    }
                  </span>
                </div>

                <div className="flex gap-2 mb-4">
                  <Badge className={`${selStatus.badgeColor} border`}>
                    {selStatus.label}
                  </Badge>
                  <Badge className={`${selCategory.color} border`}>
                    {selCategory.label}
                  </Badge>
                </div>

                <Separator className="bg-white/5 mb-4" />

                {/* Details */}
                <div className="space-y-1">
                  <DetailRow label="Request ID" value={selected.id} icon={Hash} mono copyable />
                  <DetailRow label="Email" value={selected.email} icon={Mail} copyable />
                  <DetailRow label="Submitted" value={format(new Date(selected.created_at), "MMM d, yyyy 'at' h:mm a")} icon={Clock} />
                  {selected.user_id && (
                    <DetailRow label="User ID" value={selected.user_id} icon={User} mono copyable />
                  )}
                </div>

                <Separator className="bg-white/5 my-4" />

                {/* Message */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Message</p>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{selected.message}</p>
                  </div>
                </div>

                {/* Previous reply */}
                {selected.admin_reply && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Admin Reply</p>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
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

                {/* Status change */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Update Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                      const isActive = selected.status === key;
                      return (
                        <button
                          key={key}
                          onClick={() => updateStatus(selected.id, key)}
                          disabled={isActive}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-all border ${
                            isActive
                              ? `${cfg.badgeColor} cursor-default`
                              : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator className="bg-white/5 my-4" />

                {/* Reply */}
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
