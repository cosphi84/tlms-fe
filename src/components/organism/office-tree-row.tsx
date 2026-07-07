"use client";

import React from "react";
import { ChevronRight, ChevronDown, PencilIcon } from "lucide-react";

import { TableCell, TableRow } from "@/components/atoms/table";
import { Button } from "@/components/atoms/button";
import { OfficeTypeBadge } from "@/components/atoms/office-type-badge";
import { OfficeTreeNode } from "@/lib/office-tree";
import Link from "next/link";

interface Props {
  node: OfficeTreeNode;
  depth?: number;
  index: number;
  startIndex?: number;
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return "-";
  }
}

export function OfficeTreeRow({ node, depth = 0, index, startIndex = 0 }: Props) {
  const [expanded, setExpanded] = React.useState(true);

  const hasChildren = node.children.length > 0;
  const rowNumber = startIndex + index + 1;

  return (
    <>
      <TableRow className="group">
        {/* Expand / collapse toggle */}
        <TableCell className="w-10 pr-0">
          {hasChildren ? (
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={expanded ? "Collapse" : "Expand"}
              onClick={() => setExpanded((v) => !v)}
              className="text-muted-foreground hover:text-foreground"
            >
              {expanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </Button>
          ) : (
            <span className="block size-7" />
          )}
        </TableCell>

        {/* Row number */}
        <TableCell className="w-10 text-muted-foreground text-xs">
          {rowNumber}
        </TableCell>

        {/* Code — indented by depth */}
        <TableCell>
          <div
            className="font-mono text-sm font-medium"
            style={{ paddingLeft: depth * 20 }}
          >
            {depth > 0 && (
              <span className="mr-1.5 text-muted-foreground/50">{"└ "}</span>
            )}
            {node.code}
          </div>
        </TableCell>

        {/* Name */}
        <TableCell className="font-medium">{node.name}</TableCell>

        {/* Type badge */}
        <TableCell>
          {node.type}
          { /* <OfficeTypeBadge type={node.type} /> */}
        </TableCell>

        {/* Created at */}
        <TableCell className="text-muted-foreground text-sm">
          {node.created_at ? formatDate(node.created_at) : "-"}
        </TableCell>

        <TableCell className={"text-muted-foreground text-sm"}>

            <span className="text-muted-foreground/50 flex">
              <PencilIcon className={"h-4 w-4"}/>
              <Link href={`offices/edit/${node.id}`}>edit</Link>
            </span>

        </TableCell>
      </TableRow>

      {/* Recursively render children when expanded */}
      {expanded &&
        node.children.map((child, i) => (
          <OfficeTreeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            index={i}
            startIndex={-1} // children don't need a global row number
          />
        ))}
    </>
  );
}
