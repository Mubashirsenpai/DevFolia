import { AdminNav } from "../AdminNav";
import { requireSession } from "@/lib/auth";
import { isSuperAdminSession } from "@/lib/super-admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const showSuperAdmin = await isSuperAdminSession(session);

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminNav showSuperAdmin={showSuperAdmin} />
      <main className="flex-1 overflow-auto p-6 md:p-10">{children}</main>
    </div>
  );
}
