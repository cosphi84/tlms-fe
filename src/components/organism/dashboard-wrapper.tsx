import { Fragment, PropsWithChildren } from "react";
import { DashboardHeaderProps } from "@/types/dashboard-interface";
import { SidebarInset } from "@/components/atoms/sidebar";
import { DashboardHeader } from "@/components/cells/dashboard-header";

export function DashboardWrapper({
  children,
  leftSection,
  rightSection
}: PropsWithChildren<DashboardHeaderProps>) {
  return (
    <Fragment>
      <SidebarInset className="px-0">
        <DashboardHeader
          leftSection={leftSection}
          rightSection={rightSection}
        />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 px-4 lg:px-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </Fragment>
  );
}
