import { AdminDashboardChrome } from "../AdminDashboardChrome";

export const dynamic = "force-dynamic";

export default async function AdminOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminDashboardChrome>{children}</AdminDashboardChrome>;
}
