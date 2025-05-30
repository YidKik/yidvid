
import { CategorySelector } from "./CategorySelector";

interface ContentToggleProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const ContentToggle = ({ selectedCategory, onCategoryChange }: ContentToggleProps) => {
  return (
    <CategorySelector 
      selectedCategory={selectedCategory} 
      onCategoryChange={onCategoryChange} 
    />
  );
};
