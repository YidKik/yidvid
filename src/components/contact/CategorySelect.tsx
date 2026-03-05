
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
          <p className="text-sm font-bold text-primary mb-3">What can we help with?</p>
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
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-colors duration-200 cursor-pointer text-center
                      ${isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/60 bg-background'
                      }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2
                        ${isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-[#FFCC00] border-[#FFCC00] text-primary'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-primary' : 'text-primary'}`}>
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
