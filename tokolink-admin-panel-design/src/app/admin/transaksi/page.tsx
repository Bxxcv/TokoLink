import TransaksiClient from "./transaksi-client";
import { getPaymentsData, getSettingsData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TransaksiPage() {
  const [data, cfg] = await Promise.all([getPaymentsData(), getSettingsData()]);
  return <TransaksiClient data={data} feePct={cfg.feePct} />;
}
