import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const UserRegistrationSection = () => {
  const { toast } = useToast();
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    name: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { data: users, refetch: refetchUsers } = useQuery({
    queryKey: ["registered-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error fetching users",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  const handleAddUser = async () => {
    setIsLoading(true);
    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserData.email,
        password: newUserData.password,
        options: {
          data: {
            full_name: newUserData.name,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("No user data returned");
      }

      toast({
        title: "User created successfully",
        description: `${newUserData.email} has been registered.`,
      });

      setNewUserData({ email: "", name: "", password: "" });
      setShowAddUserDialog(false);
      refetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      
      if (error.message.includes("User already registered")) {
        toast({
          title: "User already exists",
          description: "This email is already registered in the system.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error creating user",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Registration</CardTitle>
            <CardDescription>Manage user registrations and view registered users</CardDescription>
          </div>
          <Button
            onClick={() => setShowAddUserDialog(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Register New User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Total Users: {users?.length || 0}
            </span>
          </div>
          
          <div className="border rounded-lg">
            <div className="grid grid-cols-3 gap-4 p-4 border-b bg-muted/50">
              <div>Name</div>
              <div>Email</div>
              <div>Joined</div>
            </div>
            <div className="divide-y">
              {users?.map((user) => (
                <div key={user.id} className="grid grid-cols-3 gap-4 p-4">
                  <div>{user.name || "N/A"}</div>
                  <div>{user.email}</div>
                  <div>
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New User</DialogTitle>
            <DialogDescription>
              Enter the details for the new user. They will receive an email to confirm their account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newUserData.name}
                onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddUser} 
              disabled={isLoading || !newUserData.email || !newUserData.password}
            >
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};