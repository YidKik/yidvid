
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HomeWelcome() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to main page
    console.log("HomeWelcome redirecting to /");
    navigate("/");
  }, [navigate]);
  
  return <div className="h-screen flex items-center justify-center">Redirecting...</div>;
}
