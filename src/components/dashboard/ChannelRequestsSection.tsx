import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ChannelRequest = {
  id: string;
  channel_name: string;
  channel_id: string | null;
  user_id: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    email: string;
  } | null;
}

export const ChannelRequestsSection = () => {
  const { data: requests, refetch } = useQuery({
    queryKey: ["channel-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channel_requests")
        .select(`
          *,
          profiles(
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ChannelRequest[];
    },
  });

  const handleStatusUpdate = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('channel_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(`Request ${newStatus} successfully`);
      refetch();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Channel Requests</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel Name</TableHead>
              <TableHead>Channel ID</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests?.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.channel_name}</TableCell>
                <TableCell>{request.channel_id || 'Not provided'}</TableCell>
                <TableCell>{request.profiles?.email}</TableCell>
                <TableCell className="capitalize">{request.status}</TableCell>
                <TableCell className="space-x-2">
                  {request.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleStatusUpdate(request.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(request.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!requests?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No channel requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};