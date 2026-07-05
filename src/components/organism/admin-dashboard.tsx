import { CSSProperties, PropsWithChildren } from "react";
import { SidebarInset, SidebarProvider } from "@/components/atoms/sidebar";
import { AppSidebar } from "@/components/cells/app-sidebar";

export default function AdminDashboard({ children }: PropsWithChildren) {
  return (
    <SidebarProvider style={{} as CSSProperties}>
      <AppSidebar variant={"inset"} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}