"use client";

import React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

import { TableCell, TableRow } from "@/components/atoms/table";

import { Button } from "@/components/atoms/button";

import { OfficeTreeNode } from "@/lib/office-tree";

interface Props {
  node: OfficeTreeNode;
  depth?: number;
}

export function OfficeTreeRow({ node, depth = 0 }: Props) {
  const [expanded, setExpanded] = React.useState(false);

  const hasChildren = node.children.length > 0;

  return (
    <>
      <TableRow>
        <TableCell>
          {hasChildren && (
            <Button
              size="icon"
              variant="ghost"
              aria-label={"expand"}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronDown /> : <ChevronRight />}
            </Button>
          )}
        </TableCell>

        <TableCell>
          <div
            style={{
              paddingLeft: depth * 24
            }}
          >
            {node.code}
          </div>
        </TableCell>

        <TableCell>{node.name}</TableCell>

        <TableCell>{node.type.toUpperCase()}</TableCell>
      </TableRow>

      {expanded &&
        node.children.map((child) => (
          <OfficeTreeRow key={child.id} node={child} depth={depth + 1} />
        ))}
    </>
  );
}
