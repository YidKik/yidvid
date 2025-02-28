
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Music, BookOpen, Sparkles, Mic, GraduationCap, 
  Film, PlusCircle, Tag, Heart, Star, Zap, Clock,
  Award, Bookmark
} from "lucide-react";

interface AddCategoryFormProps {
  onSuccess: () => void;
}

// Simple emoji to icon mapping
const emojiIcons = [
  { emoji: '🎵', icon: <Music size={20} strokeWidth={1.5} /> },
  { emoji: '📖', icon: <BookOpen size={20} strokeWidth={1.5} /> },
  { emoji: '✨', icon: <Sparkles size={20} strokeWidth={1.5} /> },
  { emoji: '🎙️', icon: <Mic size={20} strokeWidth={1.5} /> },
  { emoji: '📚', icon: <GraduationCap size={20} strokeWidth={1.5} /> },
  { emoji: '🎬', icon: <Film size={20} strokeWidth={1.5} /> },
  { emoji: '📌', icon: <PlusCircle size={20} strokeWidth={1.5} /> },
  { emoji: '😄', icon: <Heart size={20} strokeWidth={1.5} /> },
  { emoji: '🤣', icon: <Star size={20} strokeWidth={1.5} /> },
  { emoji: '🔥', icon: <Zap size={20} strokeWidth={1.5} /> },
  { emoji: '⏰', icon: <Clock size={20} strokeWidth={1.5} /> },
  { emoji: '🏆', icon: <Award size={20} strokeWidth={1.5} /> },
  { emoji: '🔖', icon: <Bookmark size={20} strokeWidth={1.5} /> },
  { emoji: '🏷️', icon: <Tag size={20} strokeWidth={1.5} /> },
];

export function AddCategoryForm({ onSuccess }: AddCategoryFormProps) {
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

      if (!newCategory.is_emoji && selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('category-icons')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

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
      onSuccess();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  return (
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
        
        {newCategory.is_emoji && (
          <div className="grid grid-cols-7 gap-2 p-2 border rounded-md">
            {emojiIcons.map((item, index) => (
              <div
                key={index}
                className={`p-2 rounded-md cursor-pointer hover:bg-gray-100 flex items-center justify-center ${
                  newCategory.icon === item.emoji ? 'bg-gray-200' : ''
                }`}
                onClick={() => setNewCategory({ ...newCategory, icon: item.emoji })}
              >
                {item.emoji}
              </div>
            ))}
          </div>
        )}
        
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
              <p className="text-sm text-gray-500 mb-2">Note: Custom images will be displayed as outline icons.</p>
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
  );
}
