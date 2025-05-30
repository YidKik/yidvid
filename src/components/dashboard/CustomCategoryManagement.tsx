
import { CustomCategory } from "@/types/custom-categories";
import { AddCategoryForm } from "./categories/AddCategoryForm";
import { CategoryList } from "./categories/CategoryList";

interface CustomCategoryManagementProps {
  categories: CustomCategory[];
  onUpdate: () => void;
}

const defaultCategories = [
  { id: 'music', name: 'Music', icon: '🎵', is_emoji: true, created_at: '', updated_at: '' },
  { id: 'torah', name: 'Torah', icon: '📖', is_emoji: true, created_at: '', updated_at: '' },
  { id: 'inspiration', name: 'Inspiration', icon: '✨', is_emoji: true, created_at: '', updated_at: '' },
  { id: 'podcast', name: 'Podcast', icon: '🎙️', is_emoji: true, created_at: '', updated_at: '' },
  { id: 'education', name: 'Education', icon: '📚', is_emoji: true, created_at: '', updated_at: '' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', is_emoji: true, created_at: '', updated_at: '' },
  { id: 'other', name: 'Other', icon: '📌', is_emoji: true, created_at: '', updated_at: '' },
];

export function CustomCategoryManagement({ categories, onUpdate }: CustomCategoryManagementProps) {
  // Combine default and custom categories
  const allCategories = [...defaultCategories, ...categories];

  return (
    <div className="space-y-6">
      <AddCategoryForm onSuccess={onUpdate} />
      <CategoryList categories={allCategories} onUpdate={onUpdate} />
    </div>
  );
}
