
import { User, Computer, Smartphone, Clock, UserCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfilesTable } from "@/integrations/supabase/types/profiles";
import { formatDate, getUserDisplayName, getUserDevice } from "./UserManagementUtils";

interface RegularUsersTableProps {
  regularUsers: ProfilesTable["Row"][];
  toggleAdminStatus: (userId: string, currentStatus: boolean) => Promise<void>;
}

export const RegularUsersTable = ({
  regularUsers,
  toggleAdminStatus
}: RegularUsersTableProps) => {
  return (
    <div className="bg-white rounded-md border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Device</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regularUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No regular users found
              </TableCell>
            </TableRow>
          ) : (
            regularUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{getUserDisplayName(user)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                    <User className="h-3 w-3" />
                    User
                  </Badge>
                </TableCell>
                <TableCell>
                  {getUserDevice(user) === "desktop" ? (
                    <div className="flex items-center gap-1">
                      <Computer className="h-4 w-4 text-muted-foreground" />
                      <span>Desktop</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <span>Mobile</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(user.created_at)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => toggleAdminStatus(user.id, !!user.is_admin)}
                    className="flex items-center gap-1"
                  >
                    <UserCheck className="h-3 w-3" />
                    Make Admin
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
