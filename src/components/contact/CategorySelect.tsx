
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { FormValues, categoryOptions } from "./types";

interface CategorySelectProps {
  form: UseFormReturn<FormValues>;
}

export const CategorySelect = ({ form }: CategorySelectProps) => {
  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem className="space-y-4">
          <FormLabel className="font-medium">Select a Category</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="grid grid-cols-2 gap-4"
            >
              {categoryOptions.map((category) => (
                <FormItem key={category.value} className="category-radio-item">
                  <FormControl>
                    <label
                      className={`flex items-start space-x-2 space-y-0 rounded-md border-2 p-3 cursor-pointer transition-all duration-200
                        ${field.value === category.value 
                          ? 'border-primary' 
                          : 'border-white/30'
                        }`}
                    >
                      <RadioGroupItem
                        value={category.value}
                        id={category.value}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none text-center">
                          {category.label}
                        </p>
                        <p className="text-xs text-muted-foreground text-center">
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
