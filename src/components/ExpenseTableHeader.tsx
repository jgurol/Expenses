
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

  // Determine the checkbox state: true if all selected, "indeterminate" if some selected, false if none
  const checkboxState = isAllSelected ? true : isSomeSelected ? "indeterminate" : false;

  return (
    <TableHeader>
      <TableRow>
        {showMultiSelect && (
          <TableHead className="w-12">
            <Checkbox
              checked={checkboxState}
              onCheckedChange={handleSelectAllChange}
              aria-label="Select all expenses"
            />
          </TableHead>
        )}
        <TableHead className="w-48">Source Account</TableHead>
        <TableHead className="w-32">Date</TableHead>
        <TableHead className="w-64">Description</TableHead>
        <TableHead className="w-40">Category</TableHead>
        <TableHead className="text-right w-32">Amount</TableHead>
        {showClassificationStatus && <TableHead className="text-center">Status</TableHead>}
        {showDeleteButton && <TableHead className="text-center">Actions</TableHead>}
      </TableRow>
    </TableHeader>
  );
};
