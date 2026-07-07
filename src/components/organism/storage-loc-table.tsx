"use client"

import React, { useEffect, useMemo, useState } from "react";
import { useStorageLocation } from "@/queries/storage-location-query";
import { Building2, RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
, TableCell} from "@/components/atoms/table";
import { StorageTableSkeleton } from "@/components/cells/storage-table-skeleton";
import { StorageLocRespons } from "@/types/storage-loc-interface";

function filterTable(nodes: StorageLocRespons[], keyword: string): StorageLocRespons[] {
  if (!keyword.trim()) {
    return nodes;
  }

  const search = keyword.toLowerCase();

  return nodes
    .filter(node =>
    node.code.toLowerCase().includes(search) ||
    node.name.toLowerCase().includes(search) ||
      node.office.name.toLowerCase().includes(search)
    );
}

export function StorageLocTable(){
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");

  useEffect(()=>{
    const id = setTimeout(()=>{
      setSearch(inputValue);
    }, 350);

    return () => clearTimeout(id)
  }, [inputValue]);

  const {data, isLoading, isError, refetch, isFetching} = useStorageLocation();

  const filtered = useMemo(() => {
    if(!data) return [];

    return filterTable(data.data, search);
  }, [data, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search
            className={
              "absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
            }
          />

          <Input
            id="sloc-search"
            aria-label={"office search"}
            placeholder="Search code, name, or office..."
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

          <p className="text-sm font-medium">
            Failed to load Storage Location data.
          </p>

          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      )}

      {!isError && (
        <div className={"rounded-md border overflow-hidden"}>
          <Table>
            <TableHeader>
              <TableRow className={"bg-muted/40 hover:bg-muted/20"}>
                <TableHead className={"w-10 text-center"}>#</TableHead>
                <TableHead>SLoc</TableHead>
                <TableHead>Technician Name</TableHead>
                <TableHead>Office</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <StorageTableSkeleton rows={10} />
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
                filtered.map((item, i) => (
                  <TableRow className={"group"} key={i}>
                    <TableCell className={"w-10 pr-0 text-center"}>{i + 1}</TableCell>
                    <TableCell>{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.office.name}</TableCell>
                  </TableRow>
                ))
                )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}