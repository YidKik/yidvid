
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Admin PIN for backdoor access - make sure this matches with Dashboard.tsx
export const ADMIN_PIN = "Moshe@3448";

export const useAdminPinDialog = (userId?: string) => {
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const navigate = useNavigate();

  const handleUnlockWithPin = () => {
    console.log("Validating PIN:", adminPin, "against expected:", ADMIN_PIN);
    
    // Trim any whitespace and perform exact comparison
    const cleanedInputPin = adminPin.trim();
    
    if (cleanedInputPin === ADMIN_PIN) {
      // Set PIN bypass for admin access
      localStorage.setItem(`admin-pin-bypass`, "true");
      
      // Store user-specific admin status if we have a userId
      if (userId) {
        localStorage.setItem(`admin-status-${userId}`, JSON.stringify({ isAdmin: true }));
      }
      
      toast.success("Admin access granted via PIN");
      setShowPinDialog(false);
      setAdminPin("");
      
      // Navigate to dashboard with a small delay to allow state updates
      setTimeout(() => navigate("/dashboard"), 100);
    } else {
      toast.error("Incorrect PIN");
      setAdminPin("");
    }
  };

  return {
    showPinDialog,
    setShowPinDialog,
    adminPin,
    setAdminPin,
    handleUnlockWithPin
  };
};
