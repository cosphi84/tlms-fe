import { DashboardWrapper } from "@/components/organism/dashboard-wrapper";

export default function PageDashboard() {
  return (
    <DashboardWrapper leftSection={<h1>TMS Dashboard</h1>}>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        Tools Management
      </div>
    </DashboardWrapper>
  );
}