
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues, categoryOptions } from "./types";
import { Bug, Lightbulb, HelpCircle, MessageCircle } from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
  bug_report: Bug,
  feature_request: Lightbulb,
  support: HelpCircle,
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
          <p className="text-sm font-semibold text-foreground mb-3">What can we help with?</p>
          <FormControl>
            <div className="grid grid-cols-2 gap-2.5">
              {categoryOptions.map((category) => {
                const Icon = categoryIcons[category.value] || MessageCircle;
                const isSelected = field.value === category.value;
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => field.onChange(category.value)}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center
                      ${isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/40 bg-white'
                      }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs font-medium leading-tight ${isSelected ? 'text-primary' : 'text-foreground'}`}>
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
