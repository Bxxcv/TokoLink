import PengumumanClient from "./pengumuman-client";
import { getBroadcastsData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PengumumanPage() {
  const data = await getBroadcastsData();
  return <PengumumanClient data={data} />;
}
