import TarikDanaClient from "./tarik-dana-client";
import { getWithdrawalsData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TarikDanaPage() {
  const data = await getWithdrawalsData();
  return <TarikDanaClient data={data} />;
}
