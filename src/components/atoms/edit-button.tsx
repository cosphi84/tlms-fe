import { cn } from "@/lib/utils";
import Link from "next/link";
import { PencilIcon } from "lucide-react";


/**
 * Atom — small colored badge for an office type (hq, tc, cabang, area, …).
 * Falls back to uppercase type string if not in the map.
 */
export function EditItem(id :string, className?: string) {

   const cls = "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold tracking-wide",
        cls,
        className
      )}
    >
      <PencilIcon className="mr-2" />
      <Link href={`/edit/${id}`} passHref>Edit</Link>
    </span>
  );
}
