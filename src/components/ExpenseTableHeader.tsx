
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortField = 'sourceAccount' | 'date' | 'code';
type SortDirection = 'asc' | 'desc';

interface ExpenseTableHeaderProps {
  showMultiSelect: boolean;
  showClassificationStatus: boolean;
  showDeleteButton: boolean;
  showCodeColumn?: boolean;
  showReconcileButton?: boolean;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
}

export const ExpenseTableHeader = ({
  showMultiSelect,
  showClassificationStatus,
  showDeleteButton,
  showCodeColumn = false,
  showReconcileButton = false,
  isAllSelected,
  isSomeSelected,
  onSelectAll,
  sortField,
  sortDirection,
  onSort
}: ExpenseTableHeaderProps) => {
  const handleSelectAllChange = (checked: boolean | "indeterminate") => {
    onSelectAll(checked === true);
  };

  // Determine the checkbox state: true if all selected, "indeterminate" if some selected, false if none
  const checkboxState = isAllSelected ? true : isSomeSelected ? "indeterminate" : false;

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    if (!onSort) {
      return <>{children}</>;
    }
    
    return (
      <Button
        variant="ghost"
        onClick={() => onSort(field)}
        className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        {children}
        {getSortIcon(field)}
      </Button>
    );
  };

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
        <TableHead className="w-32">
          <SortableHeader field="sourceAccount">Source Account</SortableHeader>
        </TableHead>
        <TableHead className="w-24">
          <SortableHeader field="date">Date</SortableHeader>
        </TableHead>
        <TableHead className="min-w-0 flex-1">Description</TableHead>
        {showCodeColumn && (
          <TableHead className="w-24">
            <SortableHeader field="code">Code</SortableHeader>
          </TableHead>
        )}
        <TableHead className="w-36">Category</TableHead>
        <TableHead className="text-right w-24">Amount</TableHead>
        {showClassificationStatus && <TableHead className="text-center w-20">Status</TableHead>}
        {showReconcileButton && <TableHead className="text-center w-16">Reconcile</TableHead>}
        {showDeleteButton && <TableHead className="text-center w-16">Actions</TableHead>}
      </TableRow>
    </TableHeader>
  );
};
