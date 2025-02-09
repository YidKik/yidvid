
import { CustomCategory } from "@/types/custom-categories";
import { AddCategoryForm } from "./categories/AddCategoryForm";
import { CategoryList } from "./categories/CategoryList";

interface CustomCategoryManagementProps {
  categories: CustomCategory[];
  onUpdate: () => void;
}

export function CustomCategoryManagement({ categories, onUpdate }: CustomCategoryManagementProps) {
  return (
    <div className="space-y-6">
      <AddCategoryForm onSuccess={onUpdate} />
      <CategoryList categories={categories} onUpdate={onUpdate} />
    </div>
  );
}
