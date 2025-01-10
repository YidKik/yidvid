import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Youtube, Trash2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddChannelForm } from "@/components/AddChannelForm";
import { useToast } from "@/components/ui/use-toast";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is admin
  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !data?.is_admin) {
        navigate("/");
        return null;
      }

      return data;
    },
  });

  const { data: channels, refetch } = useQuery({
    queryKey: ["youtube-channels", searchQuery],
    queryFn: async () => {
      const query = supabase
        .from("youtube_channels")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query.ilike("title", `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error fetching channels",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  const handleRemoveChannel = async (channelId: string) => {
    try {
      const { error: videosError } = await supabase
        .from("youtube_videos")
        .delete()
        .eq("channel_id", channelId);

      if (videosError) throw videosError;

      const { error: channelError } = await supabase
        .from("youtube_channels")
        .delete()
        .eq("channel_id", channelId);

      if (channelError) throw channelError;

      toast({
        title: "Channel removed",
        description: "The channel and its videos have been removed from your dashboard.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error removing channel",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!profile?.is_admin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <DashboardAnalytics />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">YouTube Channels Dashboard</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2" />
          Add Channel
        </Button>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search channels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {showAddForm && (
        <AddChannelForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            refetch();
          }}
        />
      )}

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Added On</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {channels?.map((channel) => (
              <TableRow key={channel.id}>
                <TableCell className="flex items-center gap-2">
                  {channel.thumbnail_url ? (
                    <img
                      src={channel.thumbnail_url}
                      alt={channel.title}
                      className="w-8 h-8 rounded"
                    />
                  ) : (
                    <Youtube className="w-8 h-8 text-primary" />
                  )}
                  <div>
                    <p className="font-medium">{channel.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {channel.channel_id}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{channel.description || "No description"}</TableCell>
                <TableCell>
                  {new Date(channel.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveChannel(channel.channel_id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Dashboard;