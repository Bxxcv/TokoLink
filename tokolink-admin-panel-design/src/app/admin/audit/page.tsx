import AuditClient from "./audit-client";
import { getAuditData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const data = await getAuditData();
  return <AuditClient data={data} />;
}
