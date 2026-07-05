import AdminDashboard from "@/components/organism/admin-dashboard";
import { PropsWithChildren } from "react";

export default function DashboardLayout({ children } : PropsWithChildren) {
  return <AdminDashboard>{children}</AdminDashboard>;
}