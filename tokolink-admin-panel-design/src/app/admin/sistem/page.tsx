import SistemClient from "./sistem-client";
import { getSettingsData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SistemPage() {
  const data = await getSettingsData();
  return <SistemClient data={data} />;
}
