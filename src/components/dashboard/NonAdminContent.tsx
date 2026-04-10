
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck } from "lucide-react";

interface NonAdminContentProps {
  onEnterPin?: () => void;
}

export const NonAdminContent = ({ onEnterPin }: NonAdminContentProps) => {
  return (
    <Card className="max-w-md mx-auto mt-12 border-[#1e2028] bg-[#12131a]">
      <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-indigo-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Admin Access Required</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Enter your admin PIN to unlock the dashboard and manage the site.
          </p>
        </div>
        {onEnterPin && (
          <Button
            onClick={onEnterPin}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white gap-2 mt-1"
            size="lg"
          >
            <Lock className="w-4 h-4" />
            Enter Admin PIN
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
