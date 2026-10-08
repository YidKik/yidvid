
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues, categoryOptions } from "./types";
import { Bug, Sparkles, LifeBuoy, MessageCircle, LucideIcon } from "lucide-react";

const categoryIcons: Record<FormValues["category"], LucideIcon> = {
  bug_report: Bug,
  feature_request: Sparkles,
  support: LifeBuoy,
  general: MessageCircle,
};

interface CategorySelectProps {
  form: UseFormReturn<FormValues>;
}

export const CategorySelect = ({ form }: CategorySelectProps) => {
  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <p className="text-sm font-semibold mb-3" style={{ color: 'hsl(var(--foreground))' }}>What can we help with?</p>
          <FormControl>
            <div className="grid grid-cols-2 gap-2.5">
              {categoryOptions.map((category) => {
                const Icon = categoryIcons[category.value];
                const isSelected = field.value === category.value;

                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => field.onChange(category.value)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors duration-200 cursor-pointer text-center dark:border-border dark:bg-card"
                    style={{
                      borderColor: isSelected ? '#C9253A' : undefined,
                      backgroundColor: isSelected ? 'rgba(255,204,0,0.08)' : undefined,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center dark:bg-secondary"
                      style={{
                        backgroundColor: isSelected ? '#C9253A' : undefined,
                      }}
                    >
                      <Icon className="w-4 h-4 dark:!text-foreground" style={{ color: isSelected ? '#222' : undefined }} />
                    </div>
                    <span className="text-xs font-semibold leading-tight dark:!text-muted-foreground" style={{ color: isSelected ? '#222' : undefined }}>
                      {category.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
