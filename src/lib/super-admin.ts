import { SessionPayload } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export function getSuperAdminEmail() {
  return (process.env.SUPER_ADMIN_EMAIL ?? "").trim().toLowerCase();
}

export async function isSuperAdminSession(session: SessionPayload) {
  const superAdminEmail = getSuperAdminEmail();
  if (!superAdminEmail) return false;
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { email: true },
  });
  return (user?.email ?? "").toLowerCase() === superAdminEmail;
}
