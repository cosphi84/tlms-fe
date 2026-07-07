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
import { OfficeTreeTable } from "@/components/organism/office-tree-table";
import { Button } from "@/components/atoms/button";

export default function OfficePage() {
  return (
    <DashboardWrapper
      leftSection={
        <div className="flex gap-1 items-center line-clamp-1">
          <Link href={"/offices"} className={"text-gray-500"}>
            Offices
          </Link>
          <ChevronRight className="text-gray-500 size-5" />
          <span className="font-semibold">All Offices</span>
        </div>
      }
    >
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <Card className="rounded">
          <CardHeader>
            <CardTitle>Offices</CardTitle>

            <CardDescription className={"flex justify-between"}>
              <div>Office hierarchy</div>
              <div className={"flex justify-between"}>
                <Button variant="link" className="flex flex-1">
                  <Link href={"/masters/offices/new"} className="flex">
                    <PlusIcon className="mr-2" />
                    <span className="font-semibold">New Office</span>
                  </Link>
                </Button>
              </div>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <OfficeTreeTable />
          </CardContent>
        </Card>
      </div>
    </DashboardWrapper>
  );
}