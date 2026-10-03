import { supabase } from "./supabase";
import { rupiah } from "./data";

export type NotifItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  tone: "ok" | "warn" | "info";
  kind: "order" | "system";
  link?: string;
  linkLabel?: string;
};

const READ_KEY = "tl_notif_read";

export function getReadIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function markRead(ids: string[]): string[] {
  const next = [...new Set([...getReadIds(), ...ids])];
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(next));
  } catch {
    /* abaikan */
  }
  return next;
}

/**
 * Bangun daftar notifikasi dari data ASLI (orders/withdrawals/stok produk) --
 * tidak ada tabel `notifications` terpisah, ini sengaja (lihat
 * docs/THEME_ENGINE.md gaya dokumentasi serupa). Dipakai bareng oleh
 * halaman Notifikasi (DashboardB.tsx) dan badge lonceng di header
 * (components/layout.tsx) -- JANGAN duplikasi query ini lagi di tempat lain,
 * import dari sini.
 */
export async function buildNotifications(userId: string): Promise<NotifItem[]> {
  const [{ data: orders }, { data: wds }, { data: prods }] = await Promise.all([
    supabase
      .from("orders")
      .select("id,buyer_name,total,status,created_at")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false })
      .limit(15),
    supabase
      .from("withdrawals")
      .select("id,amount,status,created_at")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("products").select("id,name,stock").eq("seller_id", userId).eq("status", "aktif"),
  ]);
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const list: NotifItem[] = [];
  (
    (orders ?? []) as { id: string; buyer_name: string; total: number | string; status: string; created_at: string }[]
  ).forEach((o) => {
    if (o.status === "menunggu")
      list.push({
        id: `o-${o.id}`,
        title: `Pesanan baru ${o.id}`,
        body: `${o.buyer_name} · ${rupiah(Number(o.total))} menunggu bayar.`,
        time: fmt(o.created_at),
        tone: "warn",
        kind: "order",
        link: `/app/orders/${o.id}`,
        linkLabel: "Lihat pesanan",
      });
    else if (o.status === "dikemas")
      list.push({
        id: `o-${o.id}`,
        title: `Siap dikirim ${o.id}`,
        body: `${o.buyer_name} sudah bayar, segera kemas.`,
        time: fmt(o.created_at),
        tone: "info",
        kind: "order",
        link: `/app/orders/${o.id}`,
        linkLabel: "Lihat pesanan",
      });
    else if (o.status === "selesai")
      list.push({
        id: `o-${o.id}`,
        title: `Pesanan selesai ${o.id}`,
        body: `${rupiah(Number(o.total))} masuk saldo.`,
        time: fmt(o.created_at),
        tone: "ok",
        kind: "order",
        link: `/app/orders/${o.id}`,
        linkLabel: "Lihat pesanan",
      });
    else if (o.status === "batal")
      list.push({
        id: `o-${o.id}`,
        title: `Pesanan batal ${o.id}`,
        body: `Dari ${o.buyer_name}.`,
        time: fmt(o.created_at),
        tone: "warn",
        kind: "order",
      });
  });
  ((wds ?? []) as { id: string; amount: number | string; status: string; created_at: string }[]).forEach((w) => {
    list.push({
      id: `w-${w.id}`,
      title: `Penarikan ${rupiah(Number(w.amount))}`,
      body:
        w.status === "selesai"
          ? "Dana cair ke rekening."
          : w.status === "ditolak"
            ? "Ditolak admin, saldo kembali."
            : "Menunggu diproses admin.",
      time: fmt(w.created_at),
      tone: w.status === "selesai" ? "ok" : w.status === "ditolak" ? "warn" : "info",
      kind: "system",
      link: "/app/wallet",
      linkLabel: "Lihat saldo",
    });
  });
  ((prods ?? []) as { id: string; name: string; stock: number }[])
    .filter((p) => p.stock === 0)
    .slice(0, 5)
    .forEach((p) => {
      list.push({
        id: `s-${p.id}`,
        title: `Stok habis: ${p.name}`,
        body: "Tambah stok agar tetap bisa dibeli.",
        time: "—",
        tone: "warn",
        kind: "system",
        link: "/app/products",
        linkLabel: "Perbarui stok",
      });
    });
  return list;
}

export async function countUnread(userId: string): Promise<number> {
  const items = await buildNotifications(userId);
  const read = getReadIds();
  return items.filter((n) => !read.includes(n.id)).length;
}
