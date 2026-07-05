import { DashboardWrapper } from "@/components/organism/dashboard-wrapper";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/atoms/card";
import { OfficeTreeTable } from "@/components/organism/office-tree-table";

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

            <CardDescription>Office hierarchy</CardDescription>
          </CardHeader>

          <CardContent>
            <OfficeTreeTable />
          </CardContent>
        </Card>
      </div>
    </DashboardWrapper>
  );
}