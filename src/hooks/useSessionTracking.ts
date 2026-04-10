import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

/**
 * Tracks user sessions in the user_analytics table.
 * Creates a session row on mount, updates session_end periodically and on unmount.
 */
export const useSessionTracking = (userId: string | undefined) => {
  const sessionIdRef = useRef<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (!userId) return;

    let intervalId: ReturnType<typeof setInterval>;

    const startSession = async () => {
      try {
        const { data, error } = await supabase
          .from("user_analytics")
          .insert({
            user_id: userId,
            page_path: location.pathname,
            session_start: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (!error && data) {
          sessionIdRef.current = data.id;
        }
      } catch (e) {
        console.error("Session tracking start failed:", e);
      }
    };

    const updateSession = async () => {
      if (!sessionIdRef.current) return;
      try {
        await supabase
          .from("user_analytics")
          .update({ session_end: new Date().toISOString(), page_path: location.pathname })
          .eq("id", sessionIdRef.current);
      } catch (e) {
        // Silent fail — non-critical
      }
    };

    const endSession = () => {
      if (!sessionIdRef.current) return;
      // Use sendBeacon-style approach for reliability on page close
      const body = JSON.stringify({
        session_end: new Date().toISOString(),
        page_path: location.pathname,
      });
      // Fallback: fire and forget update
      supabase
        .from("user_analytics")
        .update({ session_end: new Date().toISOString(), page_path: location.pathname })
        .eq("id", sessionIdRef.current)
        .then(() => {});
    };

    startSession();

    // Update session_end every 60 seconds so we have a recent heartbeat
    intervalId = setInterval(updateSession, 60_000);

    // Also update on page visibility change (tab switch, minimize)
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        updateSession();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Cleanup on unmount / sign out
    const handleBeforeUnload = () => endSession();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      endSession();
    };
  }, [userId]); // intentionally not depending on location to avoid re-creating sessions on navigate

  // Update page_path when route changes (without creating new session)
  useEffect(() => {
    if (!sessionIdRef.current || !userId) return;
    supabase
      .from("user_analytics")
      .update({ page_path: location.pathname })
      .eq("id", sessionIdRef.current)
      .then(() => {});
  }, [location.pathname, userId]);
};
