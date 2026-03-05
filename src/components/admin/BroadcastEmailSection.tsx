import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Send, Loader2, Mail, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const BroadcastEmailSection = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [filterType, setFilterType] = useState("subscribed");
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { data: broadcasts, isLoading, refetch } = useQuery({
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

  const handleSend = async () => {
    setShowConfirm(false);
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-broadcast-email", {
        body: { subject, body, filterType },
      });

      if (error) throw error;

      toast({
        title: "Broadcast Sent",
        description: `Successfully sent to ${data.sent} recipients${data.failed > 0 ? ` (${data.failed} failed)` : ""}`,
      });

      setSubject("");
      setBody("");
      refetch();
    } catch (error: any) {
      console.error("Broadcast error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send broadcast",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case "sending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Sending</Badge>;
      case "partial":
        return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="w-3 h-3 mr-1" />Partial</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Compose Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Compose Broadcast Email
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Resend free tier: 3,000 emails/month, 100/day. Emails sent from onboarding@resend.dev.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Recipients</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subscribed">Subscribed Users Only</SelectItem>
                <SelectItem value="all">All Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Subject</label>
            <Input
              placeholder="Enter email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Message (HTML supported)</label>
            <Textarea
              placeholder="Write your email content here. HTML is supported..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              disabled={!subject || !body}
            >
              Preview
            </Button>
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={!subject.trim() || !body.trim() || isSending}
            >
              {isSending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" />Send Broadcast</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Broadcast History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : broadcasts?.length ? (
            <div className="space-y-3">
              {broadcasts.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{b.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(b.created_at).toLocaleString()} · {b.recipient_count} recipients · {b.filter_type === "all" ? "All Users" : "Subscribed Only"}
                    </p>
                  </div>
                  {statusBadge(b.status)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No broadcast emails sent yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Confirm Broadcast
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p><strong>Subject:</strong> {subject}</p>
            <p><strong>Recipients:</strong> {filterType === "all" ? "All users" : "Subscribed users only"}</p>
            <p className="text-muted-foreground">
              This will send an email to all matching users. This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={handleSend}>
              <Send className="w-4 h-4 mr-2" />Confirm & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg p-6 bg-white">
            <p className="text-sm text-muted-foreground mb-1">From: YidVid &lt;onboarding@resend.dev&gt;</p>
            <p className="text-sm text-muted-foreground mb-4">Subject: {subject}</p>
            <hr className="mb-4" />
            <div dangerouslySetInnerHTML={{ __html: body }} />
            <hr className="mt-8 mb-4" />
            <p className="text-xs text-center text-muted-foreground">
              You're receiving this because you're subscribed to YidVid updates.<br />
              <span className="text-primary underline cursor-pointer">Unsubscribe</span> from these emails.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
