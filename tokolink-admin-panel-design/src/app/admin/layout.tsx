import type { ReactNode } from "react";
import Shell from "@/components/shell";
import { ToastProvider } from "@/components/ui";
import { getShellData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const shell = await getShellData();
  return (
    <ToastProvider>
      <Shell
        maintenanceOn={shell.maintenanceOn}
        maintenanceMessage={shell.maintenanceMessage}
        feePct={shell.feePct}
        recentAudit={shell.recentAudit}
        stores={shell.stores}
        pending={shell.pending}
      >
        {children}
      </Shell>
    </ToastProvider>
  );
}
