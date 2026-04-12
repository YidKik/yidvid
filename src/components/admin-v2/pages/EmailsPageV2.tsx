import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mail, Send, BarChart3, Loader2, CheckCircle, XCircle, Clock, 
  AlertTriangle, ChevronDown, ChevronRight, Eye, Search, Filter,
  Users, ArrowUpRight, Inbox, TrendingUp, Megaphone
} from "lucide-react";
import { format, subDays, subHours } from "date-fns";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type TimeRange = "24h" | "7d" | "30d" | "all";
type TabView = "analytics" | "logs" | "broadcast";

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  sent: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  pending: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  failed: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  dlq: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  suppressed: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-400" },
  bounced: { bg: "bg-rose-500/10", text: "text-rose-400", dot: "bg-rose-400" },
  complained: { bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-400" },
};

const TEMPLATE_LABELS: Record<string, string> = {
  welcome: "Welcome Email",
  "channel-request-confirmation": "Channel Request",
  "channel-approved": "Channel Approved",
  "channel-rejected": "Channel Rejected",
  "contact-request-confirmation": "Contact Confirmation",
  "contact-reply": "Contact Reply",
  "video-report-acknowledgment": "Video Report",
  "video-report-resolved": "Video Report Resolved",
  "video-digest": "Video Digest",
  auth_emails: "Auth Email",
};

// ─── Main Component ───────────────────────────────────────
export const EmailsPageV2 = () => {
  const [activeTab, setActiveTab] = useState<TabView>("analytics");

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-[#13141b] border border-[#1e2028] w-fit">
        {([
          { id: "analytics", label: "Analytics", icon: BarChart3 },
          { id: "logs", label: "Email Logs", icon: Inbox },
          { id: "broadcast", label: "Broadcast", icon: Megaphone },
        ] as { id: TabView; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all",
              activeTab === id
                ? "bg-[#6366f1]/15 text-[#818cf8]"
                : "text-[#8b8fa3] hover:text-[#c4c7d4] hover:bg-[#1a1c25]"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "analytics" && <EmailAnalytics />}
      {activeTab === "logs" && <EmailLogs />}
      {activeTab === "broadcast" && <BroadcastComposer />}
    </div>
  );
};

// ─── Analytics Section ─────────────────────────────────────
function EmailAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const sinceDate = useMemo(() => {
    if (timeRange === "24h") return subHours(new Date(), 24).toISOString();
    if (timeRange === "7d") return subDays(new Date(), 7).toISOString();
    if (timeRange === "30d") return subDays(new Date(), 30).toISOString();
    return "2020-01-01T00:00:00Z";
  }, [timeRange]);

  // Fetch from both email tables
  const { data: sendLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["email-analytics-sendlog", timeRange],
    queryFn: async () => {
      const { data } = await supabase
        .from("email_send_log")
        .select("id, template_name, status, recipient_email, created_at, message_id")
        .gte("created_at", sinceDate)
        .order("created_at", { ascending: false })
        .limit(1000);
      return data || [];
    },
  });

  const { data: emailLogs, isLoading: emailLogsLoading } = useQuery({
    queryKey: ["email-analytics-emaillogs", timeRange],
    queryFn: async () => {
      const { data } = await supabase
        .from("email_logs")
        .select("id, email_type, status, recipient_email, sent_at")
        .gte("sent_at", sinceDate)
        .order("sent_at", { ascending: false })
        .limit(1000);
      return data || [];
    },
  });

  // Deduplicate send_log by message_id (latest status)
  const deduped = useMemo(() => {
    if (!sendLogs) return [];
    const map = new Map<string, any>();
    for (const log of sendLogs) {
      const key = log.message_id || log.id;
      if (!map.has(key)) map.set(key, log);
    }
    return Array.from(map.values());
  }, [sendLogs]);

  // Merge both sources
  const allEmails = useMemo(() => {
    const merged: { template: string; status: string; recipient: string; date: string }[] = [];
    for (const e of deduped) {
      merged.push({ template: e.template_name || "unknown", status: e.status || "pending", recipient: e.recipient_email || "", date: e.created_at });
    }
    for (const e of emailLogs || []) {
      merged.push({ template: e.email_type || "unknown", status: e.status || "sent", recipient: e.recipient_email || "", date: e.sent_at || "" });
    }
    return merged;
  }, [deduped, emailLogs]);

  const stats = useMemo(() => {
    const total = allEmails.length;
    const sent = allEmails.filter(e => e.status === "sent").length;
    const failed = allEmails.filter(e => ["failed", "dlq"].includes(e.status)).length;
    const pending = allEmails.filter(e => e.status === "pending").length;
    return { total, sent, failed, pending };
  }, [allEmails]);

  const byTemplate = useMemo(() => {
    const map = new Map<string, { total: number; sent: number; failed: number }>();
    for (const e of allEmails) {
      const entry = map.get(e.template) || { total: 0, sent: 0, failed: 0 };
      entry.total++;
      if (e.status === "sent") entry.sent++;
      if (["failed", "dlq"].includes(e.status)) entry.failed++;
      map.set(e.template, entry);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
  }, [allEmails]);

  const isLoading = logsLoading || emailLogsLoading;

  return (
    <div className="space-y-6">
      {/* Time Range */}
      <div className="flex gap-2">
        {(["24h", "7d", "30d", "all"] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
              timeRange === range
                ? "bg-[#6366f1] text-white"
                : "bg-[#13141b] text-[#8b8fa3] hover:bg-[#1a1c25] hover:text-[#c4c7d4] border border-[#1e2028]"
            )}
          >
            {range === "24h" ? "Last 24h" : range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "All Time"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#6366f1]" /></div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Emails" value={stats.total} icon={Mail} color="text-[#818cf8]" bgColor="bg-[#6366f1]/10" />
            <StatCard label="Delivered" value={stats.sent} icon={CheckCircle} color="text-emerald-400" bgColor="bg-emerald-500/10" />
            <StatCard label="Failed" value={stats.failed} icon={XCircle} color="text-red-400" bgColor="bg-red-500/10" />
            <StatCard label="Pending" value={stats.pending} icon={Clock} color="text-amber-400" bgColor="bg-amber-500/10" />
          </div>

          {/* By Template */}
          <div className="rounded-xl bg-[#13141b] border border-[#1e2028] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1e2028]">
              <h3 className="text-[15px] font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#818cf8]" />
                Emails by Type
              </h3>
            </div>
            <div className="divide-y divide-[#1e2028]">
              {byTemplate.length === 0 ? (
                <div className="px-5 py-8 text-center text-[#565b6e] text-sm">No emails found for this period</div>
              ) : (
                byTemplate.map(([template, data]) => (
                  <div key={template} className="px-5 py-3.5 flex items-center justify-between hover:bg-[#1a1c25] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-[#818cf8]" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-white">{TEMPLATE_LABELS[template] || template}</p>
                        <p className="text-[11px] text-[#565b6e]">{data.total} total</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {data.sent > 0 && <span className="text-xs font-medium text-emerald-400">{data.sent} sent</span>}
                      {data.failed > 0 && <span className="text-xs font-medium text-red-400">{data.failed} failed</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bgColor }: { label: string; value: number; icon: any; color: string; bgColor: string }) {
  return (
    <div className="rounded-xl bg-[#13141b] border border-[#1e2028] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-[#565b6e] uppercase tracking-wider">{label}</span>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bgColor)}>
          <Icon className={cn("w-4 h-4", color)} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  );
}

// ─── Email Logs Section ────────────────────────────────────
function EmailLogs() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const perPage = 50;

  const sinceDate = useMemo(() => {
    if (timeRange === "24h") return subHours(new Date(), 24).toISOString();
    if (timeRange === "7d") return subDays(new Date(), 7).toISOString();
    if (timeRange === "30d") return subDays(new Date(), 30).toISOString();
    return "2020-01-01T00:00:00Z";
  }, [timeRange]);

  // Fetch send_log
  const { data: sendLogs, isLoading: l1 } = useQuery({
    queryKey: ["email-logs-sendlog", timeRange],
    queryFn: async () => {
      const { data } = await supabase
        .from("email_send_log")
        .select("id, template_name, status, recipient_email, created_at, message_id, error_message, metadata")
        .gte("created_at", sinceDate)
        .order("created_at", { ascending: false })
        .limit(1000);
      return data || [];
    },
  });

  // Fetch email_logs
  const { data: emailLogs, isLoading: l2 } = useQuery({
    queryKey: ["email-logs-emaillogs", timeRange],
    queryFn: async () => {
      const { data } = await supabase
        .from("email_logs")
        .select("id, email_type, status, recipient_email, sent_at, error_message, subject")
        .gte("sent_at", sinceDate)
        .order("sent_at", { ascending: false })
        .limit(1000);
      return data || [];
    },
  });

  // Merge and deduplicate
  const allLogs = useMemo(() => {
    const logs: { id: string; template: string; status: string; recipient: string; date: string; error?: string; subject?: string }[] = [];

    // Deduplicate send_log by message_id
    const seenMsgIds = new Set<string>();
    for (const e of sendLogs || []) {
      const key = e.message_id || e.id;
      if (seenMsgIds.has(key)) continue;
      seenMsgIds.add(key);
      logs.push({
        id: e.id, template: e.template_name || "unknown", status: e.status || "pending",
        recipient: e.recipient_email || "N/A", date: e.created_at, error: e.error_message || undefined,
      });
    }

    for (const e of emailLogs || []) {
      logs.push({
        id: e.id, template: e.email_type || "unknown", status: e.status || "sent",
        recipient: e.recipient_email || "N/A", date: e.sent_at || "", subject: e.subject || undefined,
        error: e.error_message || undefined,
      });
    }

    // Sort by date desc
    logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return logs;
  }, [sendLogs, emailLogs]);

  // Get unique templates
  const templates = useMemo(() => {
    const s = new Set(allLogs.map(l => l.template));
    return Array.from(s).sort();
  }, [allLogs]);

  // Filter
  const filtered = useMemo(() => {
    return allLogs.filter(l => {
      if (templateFilter !== "all" && l.template !== templateFilter) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!l.recipient.toLowerCase().includes(q) && !l.template.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allLogs, templateFilter, statusFilter, searchQuery]);

  // Group by template for drilldown view
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const l of filtered) {
      const arr = map.get(l.template) || [];
      arr.push(l);
      map.set(l.template, arr);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filtered]);

  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="space-y-5">
      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Time Range */}
        <div className="flex gap-1">
          {(["24h", "7d", "30d", "all"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => { setTimeRange(range); setPage(0); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                timeRange === range
                  ? "bg-[#6366f1] text-white"
                  : "bg-[#13141b] text-[#8b8fa3] hover:bg-[#1a1c25] border border-[#1e2028]"
              )}
            >
              {range === "24h" ? "24h" : range === "7d" ? "7d" : range === "30d" ? "30d" : "All"}
            </button>
          ))}
        </div>

        {/* Template Filter */}
        <select
          value={templateFilter}
          onChange={(e) => { setTemplateFilter(e.target.value); setPage(0); }}
          className="bg-[#13141b] border border-[#1e2028] text-[#c4c7d4] text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
        >
          <option value="all">All Types</option>
          {templates.map(t => <option key={t} value={t}>{TEMPLATE_LABELS[t] || t}</option>)}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="bg-[#13141b] border border-[#1e2028] text-[#c4c7d4] text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
        >
          <option value="all">All Status</option>
          <option value="sent">Sent</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="dlq">Dead Letter</option>
          <option value="suppressed">Suppressed</option>
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#565b6e]" />
          <input
            type="text"
            placeholder="Search by recipient..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="w-full bg-[#13141b] border border-[#1e2028] text-[#c4c7d4] text-xs pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
          />
        </div>

        <span className="text-[11px] text-[#565b6e] ml-auto">{filtered.length} emails</span>
      </div>

      {(l1 || l2) ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#6366f1]" /></div>
      ) : (
        <>
          {/* Grouped Drilldown View */}
          <div className="space-y-3">
            {grouped.map(([template, logs]) => {
              const isExpanded = expandedTemplate === template;
              return (
                <div key={template} className="rounded-xl bg-[#13141b] border border-[#1e2028] overflow-hidden">
                  <button
                    onClick={() => setExpandedTemplate(isExpanded ? null : template)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#1a1c25] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-[#818cf8]" />
                      </div>
                      <div className="text-left">
                        <p className="text-[13px] font-semibold text-white">{TEMPLATE_LABELS[template] || template}</p>
                        <p className="text-[11px] text-[#565b6e]">{logs.length} emails</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        {(() => {
                          const sent = logs.filter(l => l.status === "sent").length;
                          const failed = logs.filter(l => ["failed", "dlq"].includes(l.status)).length;
                          return <>
                            {sent > 0 && <span className="text-[11px] font-medium text-emerald-400">{sent} sent</span>}
                            {failed > 0 && <span className="text-[11px] font-medium text-red-400">{failed} failed</span>}
                          </>;
                        })()}
                      </div>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-[#565b6e]" /> : <ChevronRight className="w-4 h-4 text-[#565b6e]" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#1e2028]">
                      <div className="divide-y divide-[#1e2028]/50">
                        {logs.slice(0, 50).map((log) => {
                          const sc = STATUS_COLORS[log.status] || STATUS_COLORS.pending;
                          return (
                            <div key={log.id} className="px-5 py-2.5 flex items-center gap-4 hover:bg-[#0f1014] transition-colors">
                              <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold min-w-[70px]", sc.bg, sc.text)}>
                                <div className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
                                {log.status}
                              </div>
                              <span className="text-[12px] text-[#c4c7d4] flex-1 truncate">{log.recipient}</span>
                              {log.error && (
                                <span className="text-[11px] text-red-400/80 truncate max-w-[200px]" title={log.error}>
                                  {log.error}
                                </span>
                              )}
                              <span className="text-[11px] text-[#565b6e] shrink-0">
                                {log.date ? format(new Date(log.date), "MMM d, h:mm a") : "N/A"}
                              </span>
                            </div>
                          );
                        })}
                        {logs.length > 50 && (
                          <div className="px-5 py-2 text-center text-[11px] text-[#565b6e]">
                            Showing 50 of {logs.length} emails
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#13141b] border border-[#1e2028] text-[#8b8fa3] hover:bg-[#1a1c25] disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs text-[#565b6e]">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#13141b] border border-[#1e2028] text-[#8b8fa3] hover:bg-[#1a1c25] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Broadcast Composer ────────────────────────────────────
function BroadcastComposer() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [filterType, setFilterType] = useState("subscribed");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const queryClient = useQueryClient();

  const { data: broadcasts, isLoading } = useQuery({
    queryKey: ["broadcast-emails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broadcast_emails")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const sendBroadcast = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("send-broadcast-email", {
        body: { subject, body, filterType },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Broadcast sent to ${data?.sent || 0} recipients`);
      setSubject("");
      setBody("");
      setShowConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["broadcast-emails"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send broadcast");
      setShowConfirm(false);
    },
  });

  return (
    <div className="space-y-6">
      {/* Compose */}
      <div className="rounded-xl bg-[#13141b] border border-[#1e2028] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2028] flex items-center gap-2">
          <Send className="w-4 h-4 text-[#818cf8]" />
          <h3 className="text-[15px] font-semibold text-white">Compose Broadcast</h3>
        </div>
        <div className="p-5 space-y-4">
          {/* Recipients */}
          <div>
            <label className="text-[11px] font-semibold text-[#8b8fa3] uppercase tracking-wider mb-1.5 block">Recipients</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-[#0a0b10] border border-[#1e2028] text-[#c4c7d4] text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
            >
              <option value="subscribed">Subscribed Users Only</option>
              <option value="all">All Users</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="text-[11px] font-semibold text-[#8b8fa3] uppercase tracking-wider mb-1.5 block">Subject</label>
            <input
              type="text"
              placeholder="Enter email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#0a0b10] border border-[#1e2028] text-[#c4c7d4] text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-[11px] font-semibold text-[#8b8fa3] uppercase tracking-wider mb-1.5 block">Message (HTML supported)</label>
            <textarea
              placeholder="Write your email content here. HTML is supported..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-[#0a0b10] border border-[#1e2028] text-[#c4c7d4] text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6366f1] min-h-[200px] font-mono resize-y"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowPreview(true)}
              disabled={!subject || !body}
              className="px-4 py-2 rounded-lg text-[13px] font-medium bg-[#1a1c25] text-[#c4c7d4] border border-[#1e2028] hover:bg-[#252730] disabled:opacity-40 transition-all"
            >
              <Eye className="w-3.5 h-3.5 inline mr-1.5" />
              Preview
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!subject.trim() || !body.trim() || sendBroadcast.isPending}
              className="px-5 py-2 rounded-lg text-[13px] font-semibold bg-[#6366f1] text-white hover:bg-[#5558e6] disabled:opacity-40 transition-all flex items-center gap-2"
            >
              {sendBroadcast.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sendBroadcast.isPending ? "Sending..." : "Send Broadcast"}
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast History */}
      <div className="rounded-xl bg-[#13141b] border border-[#1e2028] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2028]">
          <h3 className="text-[15px] font-semibold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#818cf8]" />
            Broadcast History
          </h3>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#6366f1]" /></div>
        ) : broadcasts?.length ? (
          <div className="divide-y divide-[#1e2028]">
            {broadcasts.map((b: any) => {
              const sc = b.status === "sent" ? STATUS_COLORS.sent : b.status === "sending" ? STATUS_COLORS.pending : STATUS_COLORS.pending;
              return (
                <div key={b.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-[#1a1c25] transition-colors">
                  <div>
                    <p className="text-[13px] font-medium text-white">{b.subject}</p>
                    <p className="text-[11px] text-[#565b6e] mt-0.5">
                      {format(new Date(b.created_at), "MMM d, yyyy h:mm a")} · {b.recipient_count} recipients · {b.filter_type === "all" ? "All Users" : "Subscribed"}
                    </p>
                  </div>
                  <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold", sc.bg, sc.text)}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
                    {b.status}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-[#565b6e] text-sm">No broadcasts sent yet.</div>
        )}
      </div>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => !sendBroadcast.isPending && setShowConfirm(false)}>
          <div className="bg-[#13141b] border border-[#1e2028] rounded-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white">Confirm Broadcast</h3>
                <p className="text-[12px] text-[#8b8fa3]">This cannot be undone</p>
              </div>
            </div>
            <div className="space-y-1 text-[13px] text-[#c4c7d4]">
              <p><span className="text-[#8b8fa3]">Subject:</span> {subject}</p>
              <p><span className="text-[#8b8fa3]">Recipients:</span> {filterType === "all" ? "All users" : "Subscribed users"}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={sendBroadcast.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-[#1a1c25] text-[#c4c7d4] border border-[#1e2028] hover:bg-[#252730]"
              >
                Cancel
              </button>
              <button
                onClick={() => sendBroadcast.mutate()}
                disabled={sendBroadcast.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-[#6366f1] text-white hover:bg-[#5558e6] flex items-center justify-center gap-2"
              >
                {sendBroadcast.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sendBroadcast.isPending ? "Sending..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <p className="text-xs text-gray-500">From: YidVid &lt;noreply@yidvid.co&gt;</p>
              <p className="text-xs text-gray-500">Subject: {subject}</p>
            </div>
            <hr className="mb-4" />
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: body }} />
            <hr className="mt-8 mb-4" />
            <p className="text-[10px] text-center text-gray-400">
              You're receiving this because you're subscribed to YidVid updates.<br />
              <span className="text-blue-500 underline cursor-pointer">Unsubscribe</span> from these emails.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}