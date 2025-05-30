
import { Button } from "@/components/ui/button";
import { CustomCategory } from "@/types/custom-categories";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface CategoryTableProps {
  categories: CustomCategory[];
  onManageContent: (category: CustomCategory) => void;
  onDeleteCategory: (id: string) => void;
}

export function CategoryTable({ categories, onManageContent, onDeleteCategory }: CategoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Icon</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => {
            const isDefaultCategory = category.id.length !== 36; // Check if it's not a UUID
            return (
              <TableRow key={category.id}>
                <TableCell>
                  {category.is_emoji ? (
                    <span className="text-2xl">{category.icon}</span>
                  ) : (
                    <img 
                      src={category.icon} 
                      alt={category.name}
                      className="h-8 w-8 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900">{category.name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900">
                    {isDefaultCategory ? "Default" : category.is_emoji ? "Custom Emoji" : "Custom Image"}
                  </div>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onManageContent(category)}
                  >
                    Manage Content
                  </Button>
                  {!isDefaultCategory && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteCategory(category.id)}
                    >
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  );
}
