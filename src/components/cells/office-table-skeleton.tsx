import { Skeleton } from "@/components/atoms/skeleton";
import { TableCell, TableRow } from "@/components/atoms/table";

interface OfficeTableSkeletonProps {
  rows?: number;
}

/**
 * Cell — skeleton placeholder rows for the office table while loading.
 */
export function OfficeTableSkeleton({ rows = 5 }: OfficeTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="animate-pulse">
          {/* expand toggle */}
          <TableCell className="w-10">
            <Skeleton className="size-7 rounded-md" />
          </TableCell>
          {/* # */}
          <TableCell className="w-10">
            <Skeleton className="h-4 w-5" />
          </TableCell>
          {/* code */}
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          {/* name */}
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          {/* type */}
          <TableCell>
            <Skeleton className="h-5 w-12 rounded-md" />
          </TableCell>

          {/* created at */}
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
