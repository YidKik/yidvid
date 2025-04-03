
import { ReactNode } from "react";

interface DashboardHeaderProps {
  logoSrc: string;
  title: string;
}

/**
 * Header component for the dashboard
 */
export const DashboardHeader = ({ logoSrc, title }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <img 
        src={logoSrc} 
        alt="YidVid Logo"
        className="h-24 w-auto object-contain"
      />
      <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
    </div>
  );
};
