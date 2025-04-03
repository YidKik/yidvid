
import { Card, CardContent } from "@/components/ui/card";

/**
 * Content displayed to non-admin users
 */
export const NonAdminContent = () => {
  return (
    <Card className="p-8">
      <CardContent className="text-center text-gray-500">
        You do not have admin access to view additional dashboard features. 
        If you believe this is an error, please contact the system administrator.
      </CardContent>
    </Card>
  );
};
