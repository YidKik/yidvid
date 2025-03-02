
export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <p className="text-lg">No layout sections found.</p>
      <p className="text-sm text-muted-foreground">Layout sections need to be configured in the database.</p>
    </div>
  );
};
