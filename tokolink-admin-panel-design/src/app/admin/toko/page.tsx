import TokoClient from "./toko-client";
import { getStoresData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TokoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [data, sp] = await Promise.all([getStoresData(), searchParams]);
  return <TokoClient data={data} initialQuery={sp.q ?? ""} />;
}
