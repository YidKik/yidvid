import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChannelRequest {
  id: string;
  channel_name: string;
  channel_id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  profiles: {
    email: string;
  };
}

export const ChannelRequestsSection = () => {
  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ["channel_requests"],
    queryFn: async () => {
      const { data: requestsData, error } = await supabase
        .from("channel_requests")
        .select(`
          *,
          profiles!inner (
            email
          )
        `);

      if (error) {
        console.error("Error fetching channel requests:", error);
        throw error;
      }

      return requestsData as ChannelRequest[];
    },
  });

  const handleApprove = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('channel_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Channel request approved');
      refetch();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('channel_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Channel request rejected');
      refetch();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  if (isLoading) {
    return <div>Loading channel requests...</div>;
  }

  if (!requests?.length) {
    return <div>No channel requests found.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Channel Requests</h2>
      {requests.map((request) => (
        <Card key={request.id} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{request.channel_name}</h3>
              <p className="text-sm text-gray-500">{request.profiles?.email}</p>
              <p className="text-sm text-gray-500">
                Requested: {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  request.status === 'approved'
                    ? 'default'
                    : request.status === 'rejected'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {request.status}
              </Badge>
              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApprove(request.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(request.id)}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};