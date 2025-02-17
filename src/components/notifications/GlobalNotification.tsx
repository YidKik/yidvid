
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const GlobalNotification = () => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const { data: notifications } = useQuery({
    queryKey: ["active-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_notifications")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", new Date().toISOString())
        .or(`end_date.gt.${new Date().toISOString()},end_date.is.null`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const activeNotifications = notifications?.filter(
    (notification) => !dismissedIds.includes(notification.id)
  );

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  if (!activeNotifications?.length) return null;

  return (
    <div className="fixed top-24 left-0 right-0 z-50 p-4 pointer-events-none">
      <AnimatePresence>
        {activeNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pointer-events-auto max-w-3xl mx-auto mb-3"
          >
            <div
              className={`rounded-xl p-4 shadow-lg flex items-center justify-between border ${
                notification.type === "error"
                  ? "bg-[#FFF5F5] text-red-700 border-red-100"
                  : notification.type === "warning"
                  ? "bg-[#FFFBEB] text-yellow-700 border-yellow-100"
                  : "bg-[#F0F9FF] text-blue-700 border-blue-100"
              }`}
            >
              <div className="flex items-center gap-3">
                {notification.type === "error" ? (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <Info className="w-5 h-5 flex-shrink-0" />
                )}
                <p className="text-sm font-medium leading-5">{notification.message}</p>
              </div>
              <button
                onClick={() => handleDismiss(notification.id)}
                className={`p-1.5 rounded-full transition-colors ${
                  notification.type === "error"
                    ? "hover:bg-red-50"
                    : notification.type === "warning"
                    ? "hover:bg-yellow-50"
                    : "hover:bg-blue-50"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
