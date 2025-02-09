
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CustomCategory } from "@/types/custom-categories";

interface CustomCategoryManagementProps {
  categories: CustomCategory[];
  onUpdate: () => void;
}

export function CustomCategoryManagement({ categories, onUpdate }: CustomCategoryManagementProps) {
  const [newCategory, setNewCategory] = useState({ name: "", icon: "" });

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.icon) {
      toast.error("Please fill in both name and icon fields");
      return;
    }

    try {
      const { error } = await supabase
        .from("custom_categories")
        .insert([{ name: newCategory.name, icon: newCategory.icon }]);

      if (error) throw error;

      toast.success("Category added successfully");
      setNewCategory({ name: "", icon: "" });
      onUpdate();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("custom_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Category deleted successfully");
      onUpdate();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Category name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Category icon (emoji)"
            value={newCategory.icon}
            onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
          />
        </div>
        <Button onClick={handleAddCategory}>Add Category</Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4">
                    <span className="text-2xl">{category.icon}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
