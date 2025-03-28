
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { FormValues, categoryOptions } from "./types";
import { useIsMobile } from "@/hooks/useIsMobile";

interface CategorySelectProps {
  form: UseFormReturn<FormValues>;
}

export const CategorySelect = ({ form }: CategorySelectProps) => {
  const isMobile = useIsMobile();
  
  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="font-medium">Select a Category</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-3'}`}
            >
              {categoryOptions.map((category) => (
                <FormItem key={category.value}>
                  <FormControl>
                    <label
                      className={`flex items-start space-x-2 space-y-0 rounded-md border p-3 cursor-pointer transition-all duration-200
                        ${field.value === category.value 
                          ? 'border-primary bg-primary/5' 
                          : 'border-input hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm'
                        }`}
                    >
                      <RadioGroupItem
                        value={category.value}
                        id={category.value}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {category.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </label>
                  </FormControl>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
