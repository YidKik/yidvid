
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { CategoryStats as CategoryStatsType } from "./types";
import { categories } from "./types";

interface CategoryStatsProps {
  categoryStats: CategoryStatsType[];
}

export const CategoryStats = ({ categoryStats }: CategoryStatsProps) => {
  const getCategoryIcon = (category: string) => {
    return categories.find(c => c.value === category)?.icon || '❓';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <CardTitle className="text-lg">Category Statistics</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {categoryStats.map((stat) => (
            <div key={stat.category} className="text-center p-3 bg-gray-50 rounded-lg border">
              <div className="text-2xl mb-1">
                {stat.category === 'no_category' ? '❓' : getCategoryIcon(stat.category)}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {stat.category === 'no_category' ? 'No Category' : 
                 categories.find(c => c.value === stat.category)?.label}
              </div>
              <div className="text-lg font-bold text-blue-600">{stat.count}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
