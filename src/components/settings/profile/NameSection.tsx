
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

interface NameSectionProps {
  initialName: string;
  userId: string;
}

export const NameSection = ({ initialName, userId }: NameSectionProps) => {
  const [newName, setNewName] = useState(initialName);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleNameUpdate = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        toast.error("Please sign in to update your profile");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ name: newName })
        .eq("id", session.user.id);

      if (error) {
        console.error("Error updating name:", error);
        toast.error("Failed to update name");
        throw error;
      }

      toast.success("Name updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("Failed to update name");
    }
  };

  return (
    <div className="space-y-2 bg-[#F1F0FB] p-4 rounded-lg">
      <Label htmlFor="name" className="text-lg font-semibold">Display Name</Label>
      <div className="flex gap-2">
        <Input
          id="name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter your display name"
          className="bg-white"
        />
        <Button onClick={handleNameUpdate}>Save</Button>
      </div>
      <p className="text-sm text-muted-foreground">
        This name will be displayed across the platform
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        User ID: {userId}
      </p>
    </div>
  );
};
