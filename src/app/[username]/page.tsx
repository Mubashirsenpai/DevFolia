import { notFound } from "next/navigation";
import { getPublicPortfolioByUsername } from "@/lib/data";
import { PublicPortfolioPage } from "@/components/portfolio/PublicPortfolioPage";

export const dynamic = "force-dynamic";

export default async function UserPublicPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getPublicPortfolioByUsername(username);
  if (!data) notFound();
  return <PublicPortfolioPage data={data} />;
}
