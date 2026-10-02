import PremiumClient from "./premium-client";
import { getPremiumData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PremiumPage() {
  const data = await getPremiumData();
  return <PremiumClient data={data} />;
}
