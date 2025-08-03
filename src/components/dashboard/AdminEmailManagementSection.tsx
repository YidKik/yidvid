import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Mail, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AdminEmailSetting {
  id: string;
  admin_id: string;
  email: string;
  receive_contact_notifications: boolean;
  receive_general_notifications: boolean;
  created_at: string;
}

export const AdminEmailManagementSection = () => {
  const [newEmail, setNewEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: emailSettings, isLoading, refetch } = useQuery({
    queryKey: ["admin-email-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_email_settings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AdminEmailSetting[];
    },
  });

  const addAdminEmail = async () => {
    if (!newEmail.trim()) return;

    setIsAdding(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("admin_email_settings")
        .insert({
          admin_id: user.user?.id,
          email: newEmail.trim(),
          receive_contact_notifications: true,
          receive_general_notifications: true,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin email added successfully",
      });

      setNewEmail("");
      setShowAddDialog(false);
      refetch();
    } catch (error: any) {
      console.error("Error adding admin email:", error);
      toast({
        title: "Error",
        description: "Failed to add admin email",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const removeAdminEmail = async (id: string) => {
    try {
      const { error } = await supabase
        .from("admin_email_settings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin email removed successfully",
      });

      refetch();
    } catch (error: any) {
      console.error("Error removing admin email:", error);
      toast({
        title: "Error",
        description: "Failed to remove admin email",
        variant: "destructive",
      });
    }
  };

  const updateNotificationSetting = async (
    id: string, 
    field: 'receive_contact_notifications' | 'receive_general_notifications', 
    value: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("admin_email_settings")
        .update({ [field]: value })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification setting updated",
      });

      refetch();
    } catch (error: any) {
      console.error("Error updating notification setting:", error);
      toast({
        title: "Error",
        description: "Failed to update notification setting",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Admin Email Notifications
          </CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Admin Email
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Admin Email</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  This email will receive notifications for new contact requests and other admin updates.
                </p>
                <Button 
                  onClick={addAdminEmail} 
                  disabled={!newEmail.trim() || isAdding}
                  className="w-full"
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Email
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {emailSettings?.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{setting.email}</p>
                  <Badge variant="secondary">Admin</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Added on {new Date(setting.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={setting.receive_contact_notifications}
                      onCheckedChange={(checked) => 
                        updateNotificationSetting(setting.id, 'receive_contact_notifications', checked)
                      }
                    />
                    <span className="text-sm">Contact Requests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={setting.receive_general_notifications}
                      onCheckedChange={(checked) => 
                        updateNotificationSetting(setting.id, 'receive_general_notifications', checked)
                      }
                    />
                    <span className="text-sm">General Notifications</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAdminEmail(setting.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {!emailSettings?.length && (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No admin emails configured.</p>
              <p className="text-sm text-muted-foreground">
                Add admin emails to receive notifications about contact requests and system updates.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};