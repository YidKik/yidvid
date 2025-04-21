
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HomeWelcome() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to main page
    navigate("/");
  }, [navigate]);
  
  return <></>;
}
