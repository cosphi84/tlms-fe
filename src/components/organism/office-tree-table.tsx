"use client";

import React from "react";
import { Search, RefreshCw, Building2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/atoms/table";

import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";

import { useOffices } from "@/queries/office-query";

import { buildOfficeTree, filterTree } from "@/lib/office-tree";

import { OfficeTreeRow } from "./office-tree-row";
import { OfficeTableSkeleton } from "@/components/cells/office-table-skeleton";

export function OfficeTreeTable() {
  const [search, setSearch] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    const id = setTimeout(() => {
      setSearch(inputValue);
    }, 350);

    return () => clearTimeout(id);
  }, [inputValue]);

  const { data, isLoading, isError, refetch, isFetching } = useOffices();

  const tree = React.useMemo(() => {
    if (!data) return [];

    return buildOfficeTree(data);
  }, [data]);

  const filtered = React.useMemo(() => {
    return filterTree(tree, search);
  }, [tree, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />

          <Input
            id="office-search"
            aria-label={"office search"}
            placeholder="Search code, name, or type..."
            className="pl-8"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          aria-label={"refresh page"}
          size="icon"
          onClick={() => void refetch()}
          disabled={isFetching}
          className={isFetching ? "animate-spin" : ""}
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {isError && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 py-12 text-destructive">
          <Building2 className="size-8 opacity-50" />

          <p className="text-sm font-medium">Failed to load offices</p>

          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      )}

      {!isError && (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-10" />

                <TableHead className="w-10 text-center">#</TableHead>

                <TableHead>Code</TableHead>

                <TableHead>Name</TableHead>

                <TableHead>Type</TableHead>

                <TableHead>Created</TableHead>

                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <OfficeTableSkeleton rows={10} />
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-14 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="size-8 opacity-30" />

                      <span className="text-sm">No offices found</span>

                      {search && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setInputValue("");
                            setSearch("");
                          }}
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((office, i) => (
                  <OfficeTreeRow
                    key={office.id}
                    node={office}
                    index={i}
                    startIndex={0}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {data?.length ?? 0} office
            {(data?.length ?? 0) !== 1 && "s"}
            {isFetching && (
              <span className="ml-2 text-xs opacity-60">(refreshing...)</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
