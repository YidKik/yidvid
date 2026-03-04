import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string; // tailwind bg class e.g. "bg-blue-500"
  subtitle?: string;
}

export const StatCard = ({ label, value, icon: Icon, color = "bg-[hsl(250,80%,60%)]", subtitle }: StatCardProps) => (
  <div className="bg-white rounded-xl border border-[hsl(220,13%,91%)] p-5 flex items-start gap-4">
    <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center shrink-0 text-white", color)}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-[hsl(220,10%,50%)] mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-[hsl(220,15%,18%)] leading-tight">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {subtitle && <p className="text-xs text-[hsl(220,10%,55%)] mt-1">{subtitle}</p>}
    </div>
  </div>
);
