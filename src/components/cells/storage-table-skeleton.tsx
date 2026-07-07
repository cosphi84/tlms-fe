import { TableRow , TableCell} from "@/components/atoms/table";
import { Skeleton } from "@/components/atoms/skeleton";

interface StorageTableSkeletonProps {
  rows?: number
}

export function StorageTableSkeleton({rows = 5} : StorageTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className={"animate-pulse"}>
          <TableCell>
            <Skeleton  />
          </TableCell>
          <TableCell >
            <Skeleton className="h-4 w-5 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-5 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}