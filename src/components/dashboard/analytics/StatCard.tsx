
import { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface StatCardProps {
  title: string;
  description?: string;
  value: string | number;
  icon?: ReactNode;
}

export const StatCard = ({ title, description, value, icon }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className={icon ? "flex flex-row items-center justify-between space-y-0 pb-2" : undefined}>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">
          {typeof value === "number" && value > 1000 
            ? value.toLocaleString() 
            : value}
        </p>
      </CardContent>
    </Card>
  );
};
