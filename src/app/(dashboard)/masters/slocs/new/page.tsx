import { DashboardWrapper } from "@/components/organism/dashboard-wrapper";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SlocForm } from "@/components/organism/form-new-sloc";

export default function NewOfficePage() {
  return (
    <DashboardWrapper
      leftSection={
        <div className="flex gap-1 items-center line-clamp-1 text-sm">
          <Link href="/masters/offices" className="text-muted-foreground hover:text-foreground transition-colors">
            Storage Loc
          </Link>
          <ChevronRight className="text-muted-foreground size-4 shrink-0" />
          <span className="font-semibold">New Storage Location</span>
        </div>
      }
    >
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 max-w-2xl">
        <SlocForm />
      </div>
    </DashboardWrapper>
  );
}