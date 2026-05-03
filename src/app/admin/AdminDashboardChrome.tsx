import { AdminDashboardLayoutClient } from "./AdminDashboardLayoutClient";
import { requireSession } from "@/lib/auth";
import { isSuperAdminSession } from "@/lib/super-admin";

export async function AdminDashboardChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const showSuperAdmin = await isSuperAdminSession(session);

  return (
    <AdminDashboardLayoutClient showSuperAdmin={showSuperAdmin}>
      {children}
    </AdminDashboardLayoutClient>
  );
}
