import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Loader2, Eye, MessageSquare, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  status: string;
  created_at: string;
  admin_reply?: string;
  replied_by?: string;
  replied_at?: string;
}

export const ContactRequestsSection = () => {
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const queryClient = useQueryClient();

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ["contact-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ContactRequest[];
    },
  });

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    const { error } = await supabase
      .from("contact_requests")
      .update({ status: newStatus })
      .eq("id", requestId);

    if (error) {
      console.error("Error updating request status:", error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    } else {
      refetch();
      toast({
        title: "Success",
        description: "Request status updated successfully",
      });
    }
  };

  const sendReply = async () => {
    if (!selectedRequest || !replyText.trim()) return;

    setIsReplying(true);
    try {
      // Update the request with admin reply
      const { data: user } = await supabase.auth.getUser();
      const { error: updateError } = await supabase
        .from("contact_requests")
        .update({
          admin_reply: replyText,
          replied_by: user.user?.id,
          replied_at: new Date().toISOString(),
          status: "resolved"
        })
        .eq("id", selectedRequest.id);

      if (updateError) throw updateError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke("send-contact-notifications", {
        body: {
          type: "admin_reply",
          requestId: selectedRequest.id,
          adminReply: replyText
        }
      });

      if (emailError) {
        console.error("Email notification error:", emailError);
        // Don't fail the whole operation if email fails
      }

      toast({
        title: "Reply Sent",
        description: "Your reply has been sent to the user via email",
      });

      setReplyText("");
      setSelectedRequest(null);
      refetch();
    } catch (error: any) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setIsReplying(false);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      bug_report: "bg-destructive/10 text-destructive",
      feature_request: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      support: "bg-primary/10 text-primary",
      general: "bg-muted text-muted-foreground",
    };
    return colors[category] || colors.general;
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      resolved: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      closed: "bg-muted text-muted-foreground",
    };
    return colors[status] || colors.pending;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests?.map((request) => (
        <Card key={request.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{request.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryBadgeColor(request.category)}>
                    {request.category.replace("_", " ")}
                  </Badge>
                  <Badge className={getStatusBadgeColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{request.email}</p>
              <p className="line-clamp-2">{request.message}</p>
              
              {request.admin_reply && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Admin Reply:</p>
                  <p className="text-sm">{request.admin_reply}</p>
                  {request.replied_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Replied on {format(new Date(request.replied_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Contact Request Details</DialogTitle>
                    </DialogHeader>
                    {selectedRequest && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Name</label>
                            <p>{selectedRequest.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <p>{selectedRequest.email}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Category</label>
                            <Badge className={getCategoryBadgeColor(selectedRequest.category)}>
                              {selectedRequest.category.replace("_", " ")}
                            </Badge>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <Badge className={getStatusBadgeColor(selectedRequest.status)}>
                              {selectedRequest.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Message</label>
                          <div className="bg-muted p-3 rounded-lg mt-1">
                            {selectedRequest.message}
                          </div>
                        </div>

                        {selectedRequest.admin_reply && (
                          <div>
                            <label className="text-sm font-medium">Previous Reply</label>
                            <div className="bg-primary/10 p-3 rounded-lg mt-1">
                              {selectedRequest.admin_reply}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium">Send Reply</label>
                          <Textarea
                            placeholder="Type your reply here..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="mt-1"
                            rows={4}
                          />
                          <Button
                            onClick={sendReply}
                            disabled={!replyText.trim() || isReplying}
                            className="mt-2"
                          >
                            {isReplying ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4 mr-2" />
                            )}
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <select
                  value={request.status}
                  onChange={(e) => updateRequestStatus(request.id, e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {!requests?.length && (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No contact requests found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};