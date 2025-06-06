
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
  const handleSelectAllChange = (checked: boolean | "indeterminate") => {
    onSelectAll(checked === true);
  };

  return (
    <TableHeader>
      <TableRow>
        {showMultiSelect && (
          <TableHead className="w-12">
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el) {
                  el.indeterminate = isSomeSelected && !isAllSelected;
                }
              }}
              onCheckedChange={handleSelectAllChange}
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
