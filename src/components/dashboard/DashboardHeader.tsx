
import { ReactNode } from "react";

interface DashboardHeaderProps {
  title: string;
}

export const DashboardHeader = ({ title }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
    </div>
  );
};
