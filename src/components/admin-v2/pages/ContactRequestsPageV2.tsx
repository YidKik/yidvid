import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Mail, Send, Loader2, X, Clock, Hash, User,
  MessageSquare, CheckCircle, AlertCircle, Eye, Copy
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

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: AlertCircle },
  resolved: { label: "Resolved", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
  closed: { label: "Closed", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: X },
};

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  bug_report: { label: "Bug Report", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  feature_request: { label: "Feature Request", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  support: { label: "Support", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  general: { label: "General", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

export const ContactRequestsPageV2 = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
    let result = requests;
    if (statusFilter !== "all") {
      result = result.filter(r => r.status === statusFilter);
    }
    if (!searchQuery) return result;
    const q = searchQuery.toLowerCase();
    return result.filter(r =>
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.message?.toLowerCase().includes(q) ||
      r.id?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q)
    );
  }, [requests, searchQuery, statusFilter]);

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
        {/* Search + filter tabs */}
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search by name, email, message, or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1a1b23] border-white/10 text-gray-200 placeholder:text-gray-500"
            />
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

              return (
                <Card
                  key={request.id}
                  className={`cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-white/10 border-white/20"
                      : "bg-[#1a1b23] border-white/5 hover:bg-white/5 hover:border-white/10"
                  }`}
                  onClick={() => setSelectedId(request.id)}
                >
                  <CardContent className="p-4">
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
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Badge className={`${status.color} border text-[10px] px-1.5 py-0`}>
                          {status.label}
                        </Badge>
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
        {selected ? (
          <Card className="bg-[#1a1b23] border-white/5 h-full flex flex-col">
            <CardContent className="p-5 flex-1 overflow-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{selected.name}</h3>
                <button onClick={() => setSelectedId(null)} className="text-gray-500 hover:text-gray-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <Badge className={`${(STATUS_CONFIG[selected.status] || STATUS_CONFIG.pending).color} border`}>
                  {(STATUS_CONFIG[selected.status] || STATUS_CONFIG.pending).label}
                </Badge>
                <Badge className={`${(CATEGORY_CONFIG[selected.category] || CATEGORY_CONFIG.general).color} border`}>
                  {(CATEGORY_CONFIG[selected.category] || CATEGORY_CONFIG.general).label}
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
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => updateStatus(selected.id, key)}
                      disabled={selected.status === key}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        selected.status === key
                          ? "bg-white/15 text-white cursor-default"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {cfg.label}
                    </button>
                  ))}
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
        ) : (
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
