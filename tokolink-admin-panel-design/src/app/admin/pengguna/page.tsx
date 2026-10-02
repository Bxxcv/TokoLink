import PenggunaClient from "./pengguna-client";
import { getUsersData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PenggunaPage() {
  const data = await getUsersData();
  return <PenggunaClient data={data} />;
}
