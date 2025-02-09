
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomCategory } from "@/types/custom-categories";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CategoryListProps {
  categories: CustomCategory[];
  onUpdate: () => void;
}

export function CategoryList({ categories, onUpdate }: CategoryListProps) {
  const handleDeleteCategory = async (id: string) => {
    try {
      const categoryToDelete = categories.find(cat => cat.id === id);
      
      if (categoryToDelete && !categoryToDelete.is_emoji) {
        const fileName = categoryToDelete.icon.split('/').pop();
        if (fileName) {
          const { error: deleteStorageError } = await supabase.storage
            .from('category-icons')
            .remove([fileName]);

          if (deleteStorageError) throw deleteStorageError;
        }
      }

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
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Existing Categories</h3>
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
                Type
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
                  {category.is_emoji ? (
                    <span className="text-2xl">{category.icon}</span>
                  ) : (
                    <img 
                      src={category.icon} 
                      alt={category.name}
                      className="h-8 w-8 object-cover rounded"
                    />
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{category.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {category.is_emoji ? "Emoji" : "Image"}
                  </div>
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
    </Card>
  );
}
