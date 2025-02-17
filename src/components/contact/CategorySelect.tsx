
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
        <FormItem className="space-y-3">
          <FormLabel className="text-sm md:text-base text-white">Select a Category</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="grid grid-cols-1 gap-3"
            >
              {categoryOptions.map((category) => (
                <FormItem key={category.value}>
                  <FormControl>
                    <label
                      className={`flex items-start space-x-3 space-y-0 rounded-md border p-3 cursor-pointer hover:bg-[#444444] transition-colors ${
                        field.value === category.value ? 'border-primary' : 'border-gray-600'
                      }`}
                    >
                      <RadioGroupItem
                        value={category.value}
                        id={category.value}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <p className="text-sm md:text-base font-medium leading-none text-white">
                          {category.label}
                        </p>
                        <p className="text-xs md:text-sm text-gray-300">
                          {category.description}
                        </p>
                      </div>
                    </label>
                  </FormControl>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage className="text-xs md:text-sm text-red-400" />
        </FormItem>
      )}
    />
  );
};
