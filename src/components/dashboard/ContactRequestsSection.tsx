
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export const ContactRequestsSection = () => {
  const { data: requests, isLoading } = useQuery({
    queryKey: ["contact-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    const { error } = await supabase
      .from("contact_requests")
      .update({ status: newStatus })
      .eq("id", requestId);

    if (error) {
      console.error("Error updating request status:", error);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      bug_report: "bg-red-100 text-red-800",
      feature_request: "bg-purple-100 text-purple-800",
      support: "bg-blue-100 text-blue-800",
      general: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.general;
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
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
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests?.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">
                {format(new Date(request.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <Badge className={getCategoryBadgeColor(request.category)}>
                  {request.category.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>{request.name}</TableCell>
              <TableCell>{request.email}</TableCell>
              <TableCell className="max-w-md">
                <div className="truncate">{request.message}</div>
              </TableCell>
              <TableCell>
                <Select
                  defaultValue={request.status}
                  onValueChange={(value) => updateRequestStatus(request.id, value)}
                >
                  <SelectTrigger className={`w-32 ${getStatusBadgeColor(request.status)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
