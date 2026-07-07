import { DashboardWrapper } from "@/components/organism/dashboard-wrapper";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { OfficeForm } from "@/components/organism/form-new-office";

export default function NewOfficePage() {
  return (
    <DashboardWrapper
      leftSection={
        <div className="flex gap-1 items-center line-clamp-1 text-sm">
          <Link href="/masters/offices" className="text-muted-foreground hover:text-foreground transition-colors">
            Offices
          </Link>
          <ChevronRight className="text-muted-foreground size-4 shrink-0" />
          <span className="font-semibold">New Office</span>
        </div>
      }
    >
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 max-w-2xl">
        <OfficeForm />
      </div>
    </DashboardWrapper>
  );
}