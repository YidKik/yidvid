
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CustomCategory } from "@/types/custom-categories";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CustomCategoryManagementProps {
  categories: CustomCategory[];
  onUpdate: () => void;
}

export function CustomCategoryManagement({ categories, onUpdate }: CustomCategoryManagementProps) {
  const [newCategory, setNewCategory] = useState({ 
    name: "", 
    icon: "", 
    is_emoji: true 
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast.error("Please enter a category name");
      return;
    }

    if (!newCategory.is_emoji && !selectedFile) {
      toast.error("Please select an image file");
      return;
    }

    if (newCategory.is_emoji && !newCategory.icon) {
      toast.error("Please enter an emoji");
      return;
    }

    try {
      let iconPath = newCategory.icon;

      // If it's an image upload, handle the file upload first
      if (!newCategory.is_emoji && selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('category-icons')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('category-icons')
          .getPublicUrl(filePath);

        iconPath = publicUrl;
      }

      const { error } = await supabase
        .from("custom_categories")
        .insert([{ 
          name: newCategory.name, 
          icon: iconPath,
          is_emoji: newCategory.is_emoji
        }]);

      if (error) throw error;

      toast.success("Category added successfully");
      setNewCategory({ name: "", icon: "", is_emoji: true });
      setSelectedFile(null);
      onUpdate();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const categoryToDelete = categories.find(cat => cat.id === id);
      
      // If it's not an emoji, delete the file from storage
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
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="icon-type"
              checked={newCategory.is_emoji}
              onCheckedChange={(checked) => {
                setNewCategory({ ...newCategory, is_emoji: checked, icon: "" });
                setSelectedFile(null);
              }}
            />
            <Label htmlFor="icon-type">Use Emoji</Label>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>
            
            {newCategory.is_emoji ? (
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Category icon (emoji)"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                />
              </div>
            ) : (
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                    }
                  }}
                />
              </div>
            )}
            
            <Button onClick={handleAddCategory}>Add Category</Button>
          </div>
        </div>
      </Card>

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
    </div>
  );
}
