import { DashboardWrapper } from "@/components/organism/dashboard-wrapper";
import Link from "next/link";
import { ChevronRight, PlusIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";

export default function StorageLocPage() {
  return (
    <DashboardWrapper
      leftSection={
        <div className="flex gap-1 items-center line-clamp-1">
          <Link href={"/offices"} className={"text-gray-500"}>
            Storage Locations
          </Link>
          <ChevronRight className="text-gray-500 size-5" />
          <span className="font-semibold">All Storage Locations</span>
        </div>
      }
    >
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <Card className="rounded">
          <CardHeader>
            <CardTitle>Storage Locs</CardTitle>

            <CardDescription className={"flex justify-between"}>
              <div>All Storage Locations</div>
              <div className={"flex justify-between"}>
                <Button variant="link" className="flex flex-1">
                  <Link href={"sloc/new"} className="flex">
                    <PlusIcon className="mr-2" />
                    <span className="font-semibold">New Sloc</span>
                  </Link>
                </Button>
              </div>
            </CardDescription>
          </CardHeader>

          <CardContent>
            Storage Loc
          </CardContent>
        </Card>
      </div>
    </DashboardWrapper>
  );
}
