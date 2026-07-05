"use client";

import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/atoms/table";

import { Input } from "@/components/atoms/input";

import { useOfficeTree } from "@/queries/office-query";

import { buildOfficeTree, filterTree } from "@/lib/office-tree";

import { OfficeTreeRow } from "./office-tree-row";

export function OfficeTreeTable() {
  const [search, setSearch] = React.useState("");

  const { data, isLoading, isError } = useOfficeTree();

  const tree = React.useMemo(() => {
    if (!data?.data) {
      return [];
    }

    return buildOfficeTree(data.data);
  }, [data]);

  const filtered = React.useMemo(
    () => filterTree(tree, search),
    [tree, search]
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Failed to load offices</div>;
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search office..."
        value={search}
        aria-label={`Search ${search}`}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((office) => (
            <OfficeTreeRow key={office.id} node={office} />
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>No offices found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
