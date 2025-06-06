
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface ExpenseTableHeaderProps {
  showMultiSelect: boolean;
  showClassificationStatus: boolean;
  showDeleteButton: boolean;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onSelectAll: (checked: boolean) => void;
}

export const ExpenseTableHeader = ({
  showMultiSelect,
  showClassificationStatus,
  showDeleteButton,
  isAllSelected,
  isSomeSelected,
  onSelectAll
}: ExpenseTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        {showMultiSelect && (
          <TableHead className="w-12">
            <Checkbox
              checked={isAllSelected || isSomeSelected}
              onCheckedChange={onSelectAll}
              aria-label="Select all expenses"
            />
          </TableHead>
        )}
        <TableHead>Account</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Description</TableHead>
        <TableHead>Category</TableHead>
        <TableHead className="text-right">Amount</TableHead>
        {showClassificationStatus && <TableHead className="text-center">Status</TableHead>}
        {showDeleteButton && <TableHead className="text-center">Actions</TableHead>}
      </TableRow>
    </TableHeader>
  );
};
