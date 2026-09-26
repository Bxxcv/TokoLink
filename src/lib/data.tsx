import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------- formatting ------------------------------ */
export const rupiah = (n: number) =>
  "Rp" + Math.round(n).toLocaleString("id-ID").replace(/,/g, ".");
export const rupiahShort = (n: number) => {
  if (n >= 1_000_000_000) return "Rp" + (n / 1_000_000_000).toFixed(1).replace(".", ",") + " M";
  if (n >= 1_000_000) return "Rp" + (n / 1_000_000).toFixed(1).replace(".", ",") + " jt";
  if (n >= 1_000) return "Rp" + Math.round(n / 1_000) + "rb";
  return rupiah(n);
};
export const angka = (n: number) => n.toLocaleString("id-ID");

/* ------------------------------- mock data -------------------------------- */
export type Product = {
  id: string;
  name: string;
  cat: string;
  price: number;
  unit: string;
  img: string;
  stock: number;
  sku: string;
  sold: number;
  status: "aktif" | "nonaktif";
  weight: number;
  desc: string;
};

export const CATEGORIES = ["Semua", "Kue & Snack", "Sambal & Bumbu", "Kopi & Minuman", "Panen & Herbal"];

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Kue Lapis Legit 380g",
    cat: "Kue & Snack",
    price: 85000,
    unit: "/ box",
    img: "images/p-lapis.jpg",
    stock: 12,
    sku: "LL-380",
    sold: 214,
    status: "aktif",
    weight: 500,
    desc: "Lapis legit 18 lapis, dibuat pagi hari tanpa pengawet. Aman tahan 7 hari di suhu ruang, 14 hari di kulkas. Cocok untuk hampers dan acara kantor.",
  },
  {
    id: "p2",
    name: "Sambal Bawang Bu Ani 250ml",
    cat: "Sambal & Bumbu",
    price: 32000,
    unit: "/ botol",
    img: "images/p-sambal.jpg",
    stock: 40,
    sku: "SB-250",
    sold: 388,
    status: "aktif",
    weight: 350,
    desc: "Sambal bawang ulek kasar dengan cabai rawit pilihan. Tanpa MSG, digoreng segar tiap pesanan. Pedas level 3 dari 5.",
  },
  {
    id: "p3",
    name: "Kopi Robusta Lampung 200g",
    cat: "Kopi & Minuman",
    price: 46000,
    unit: "/ pack",
    img: "images/p-kopi.jpg",
    stock: 26,
    sku: "KR-200",
    sold: 176,
    status: "aktif",
    weight: 260,
    desc: "Biji robusta sangrai medium, kemasan foil katup satu arah. Bisa pilih biji utuh atau bubuk saat checkout di catatan pesanan.",
  },
  {
    id: "p4",
    name: "Madu Hutan Sumbawa 500ml",
    cat: "Panen & Herbal",
    price: 120000,
    unit: "/ botol",
    img: "images/p-madu.jpg",
    stock: 0,
    sku: "MH-500",
    sold: 91,
    status: "aktif",
    weight: 700,
    desc: "Madu hutan asli Sumbawa, diambil dua kali setahun. Sedimentasi alami itu wajar, bukan tanda rusak.",
  },
  {
    id: "p5",
    name: "Keripik Singkong Balado 200g",
    cat: "Kue & Snack",
    price: 24000,
    unit: "/ pack",
    img: "images/p-keripik.jpg",
    stock: 58,
    sku: "KS-200",
    sold: 502,
    status: "aktif",
    weight: 240,
    desc: "Singkong potong tipis, digoreng harian, balado merah yang gurih. Kemasan aluminium foil supaya tetap renyah.",
  },
];

export type OrderStatus = "menunggu" | "dikemas" | "dikirim" | "selesai" | "batal";
export type Order = {
  id: string;
  customer: string;
  city: string;
  items: string;
  qty: number;
  total: number;
  status: OrderStatus;
  date: string;
  channel: string;
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  menunggu: "Menunggu bayar",
  dikemas: "Sedang dikemas",
  dikirim: "Dalam pengiriman",
  selesai: "Selesai",
  batal: "Dibatalkan",
};

export const ORDERS: Order[] = [
  { id: "TL-2502-0192", customer: "Rizky Maulana", city: "Bandung", items: "Kue Lapis Legit 380g", qty: 2, total: 170000, status: "menunggu", date: "12 Feb 2025, 09:41", channel: "QRIS" },
  { id: "TL-2502-0191", customer: "Siti Nurhaliza", city: "Cimahi", items: "Sambal Bawang 250ml", qty: 3, total: 96000, status: "dikemas", date: "12 Feb 2025, 08:15", channel: "QRIS" },
  { id: "TL-2502-0190", customer: "Bagas Prasetyo", city: "Jakarta Selatan", items: "Kopi Robusta 200g", qty: 1, total: 52000, status: "dikirim", date: "11 Feb 2025, 19:02", channel: "Transfer BCA" },
  { id: "TL-2502-0189", customer: "Dewi Anggraini", city: "Bekasi", items: "Keripik Singkong 200g", qty: 5, total: 120000, status: "selesai", date: "11 Feb 2025, 15:47", channel: "QRIS" },
  { id: "TL-2502-0188", customer: "Andi Saputra", city: "Depok", items: "Madu Hutan 500ml", qty: 1, total: 120000, status: "batal", date: "11 Feb 2025, 13:20", channel: "QRIS" },
  { id: "TL-2502-0187", customer: "Nadia Putri", city: "Bandung", items: "Lapis Legit + Keripik", qty: 3, total: 194000, status: "selesai", date: "10 Feb 2025, 16:58", channel: "QRIS" },
  { id: "TL-2502-0186", customer: "Hendra Wijaya", city: "Surabaya", items: "Sambal Bawang 250ml", qty: 6, total: 192000, status: "selesai", date: "10 Feb 2025, 11:33", channel: "Transfer Mandiri" },
  { id: "TL-2502-0185", customer: "Lestari Dewi", city: "Semarang", items: "Kopi Robusta 200g", qty: 2, total: 92000, status: "selesai", date: "9 Feb 2025, 10:04", channel: "QRIS" },
];

export const SALES_30 = [
  420, 510, 380, 640, 720, 580, 690, 810, 760, 940, 880, 1020, 960, 1180, 1090, 1240, 1150, 1320,
  1280, 1460, 1390, 1520, 1410, 1680, 1590, 1740, 1620, 1890, 1810, 2040,
];
export const VISITORS_30 = [
  180, 210, 165, 240, 268, 232, 255, 290, 275, 320, 305, 344, 330, 372, 356, 398, 375, 420, 405,
  452, 438, 470, 455, 502, 486, 524, 508, 556, 540, 588,
];
export const DAY_LABELS = [
  "14 Jan", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28",
  "29", "30", "31", "1 Feb", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
];

export const SOURCES = [
  { label: "Tautan bio (Instagram)", value: 38, visitors: 912 },
  { label: "WhatsApp", value: 26, visitors: 620 },
  { label: "QRIS & QR cetak", value: 17, visitors: 405 },
  { label: "Pencarian Google", value: 12, visitors: 286 },
  { label: "Lainnya", value: 7, visitors: 167 },
];

export const FUNNEL = [
  { label: "Pengunjung toko", value: 2390 },
  { label: "Lihat produk", value: 1436 },
  { label: "Masuk keranjang", value: 418 },
  { label: "Checkout", value: 172 },
  { label: "Bayar", value: 142 },
];

export const TOP_PRODUCTS = [
  { label: "Keripik Singkong Balado", value: 502, revenue: 12048000 },
  { label: "Sambal Bawang 250ml", value: 388, revenue: 12416000 },
  { label: "Kue Lapis Legit 380g", value: 214, revenue: 18190000 },
  { label: "Kopi Robusta 200g", value: 176, revenue: 8096000 },
  { label: "Madu Hutan 500ml", value: 91, revenue: 10920000 },
];

export const HOURLY = [
  4, 3, 2, 2, 1, 3, 9, 22, 38, 46, 41, 55, 68, 62, 49, 44, 51, 63, 88, 104, 96, 74, 41, 18,
];

export type Notif = {
  id: string;
  title: string;
  body: string;
  time: string;
  tone: "info" | "ok" | "warn";
  unread: boolean;
};

export const NOTIFS: Notif[] = [
  { id: "n1", title: "Pesanan baru TL-2502-0192", body: "Rizky Maulana menunggu pembayaran QRIS. Stok Kue Lapis Legit tersisa 12.", time: "3 menit lalu", tone: "info", unread: true },
  { id: "n2", title: "Pembayaran diterima", body: "Rp96.000 dari Siti Nurhaliza via QRIS masuk ke saldo.", time: "1 jam lalu", tone: "ok", unread: true },
  { id: "n3", title: "Stok hampir habis", body: "Madu Hutan Sumbawa 500ml sudah 0. Sembunyikan sementara atau minta restock.", time: "Kemarin, 20:12", tone: "warn", unread: true },
  { id: "n4", title: "Penarikan dana berhasil", body: "Rp1.250.000 sudah masuk ke BCA •••• 4821.", time: "Kemarin, 14:30", tone: "ok", unread: false },
  { id: "n5", title: "Kode promo HARIAN5 dipakai 14 kali", body: "Diskon yang diberikan Rp336.000. Penjualan naik 18% dibanding minggu lalu.", time: "2 hari lalu", tone: "info", unread: false },
  { id: "n6", title: "Toko libur hari Minggu", body: "Jam buka hari Minggu belum diatur. Pembeli masih bisa pesan, pengiriman Senin.", time: "3 hari lalu", tone: "warn", unread: false },
];

export const BALANCE_HISTORY = [
  { id: "TRX-8841", label: "Penjualan TL-2502-0189", date: "11 Feb 2025", amount: 120000, type: "masuk" },
  { id: "TRX-8836", label: "Penarikan ke BCA •••• 4821", date: "11 Feb 2025", amount: -1250000, type: "keluar" },
  { id: "TRX-8829", label: "Penjualan TL-2502-0187", date: "10 Feb 2025", amount: 194000, type: "masuk" },
  { id: "TRX-8814", label: "Biaya layanan QRIS", date: "10 Feb 2025", amount: -2840, type: "keluar" },
  { id: "TRX-8802", label: "Penjualan TL-2502-0185", date: "9 Feb 2025", amount: 92000, type: "masuk" },
];

export const BIO_LINKS = [
  { id: "b1", label: "WhatsApp — tanya stok & pre-order", url: "wa.me/6281234567890", icon: "wa", clicks: 1284, on: true },
  { id: "b2", label: "Instagram @dapoer.buani", url: "instagram.com/dapoer.buani", icon: "ig", clicks: 942, on: true },
  { id: "b3", label: "Katalog lengkap (halaman ini)", url: "tokolink.id/dapoer-bu-ani", icon: "link", clicks: 613, on: true },
  { id: "b4", label: "Resep & tips masak", url: "tokolink.id/dapoer-bu-ani/resep", icon: "doc", clicks: 218, on: false },
  { id: "b5", label: "Gabung grup reseller", url: "chat.whatsapp.com/…", icon: "wa", clicks: 87, on: true },
];

export const DISCOUNTS = [
  { code: "HARIAN5", type: "Persen", value: "5%", min: 50000, used: 14, limit: 50, until: "28 Feb 2025", on: true },
  { code: "ONGKIRGRATIS", type: "Potongan ongkir", value: "Rp15.000", min: 150000, used: 32, limit: 100, until: "31 Mar 2025", on: true },
  { code: "LIBURAN", type: "Nominal", value: "Rp10.000", min: 80000, used: 50, limit: 50, until: "20 Feb 2025", on: false },
];

export const HOURS = [
  { d: "Senin", open: "08:00", close: "20:00", on: true },
  { d: "Selasa", open: "08:00", close: "20:00", on: true },
  { d: "Rabu", open: "08:00", close: "20:00", on: true },
  { d: "Kamis", open: "08:00", close: "20:00", on: true },
  { d: "Jumat", open: "08:00", close: "21:00", on: true },
  { d: "Sabtu", open: "07:00", close: "21:00", on: true },
  { d: "Minggu", open: "09:00", close: "15:00", on: false },
];

/* ------------------------------- admin data ------------------------------- */
export const SELLERS = [
  { id: "SLR-0142", name: "Dapoer Bu Ani", owner: "Ani Rahayu", city: "Bandung", plan: "Premium", sales: 58400000, orders: 142, status: "aktif", joined: "12 Apr 2024" },
  { id: "SLR-0139", name: "Batik Laweyan Solo", owner: "Wahyu Setiawan", city: "Surakarta", plan: "Gratis", sales: 31200000, orders: 88, status: "aktif", joined: "2 Apr 2024" },
  { id: "SLR-0131", name: "Kriya Nusa Craft", owner: "Melati Kusuma", city: "Yogyakarta", plan: "Premium", sales: 76900000, orders: 214, status: "aktif", joined: "18 Mar 2024" },
  { id: "SLR-0127", name: "Snack Box Jaksel", owner: "Fajar Nugroho", city: "Jakarta Selatan", plan: "Gratis", sales: 12800000, orders: 46, status: "ditangguhkan", joined: "9 Mar 2024" },
  { id: "SLR-0118", name: "Anyaman Lombok", owner: "Siti Aminah", city: "Mataram", plan: "Premium", sales: 44500000, orders: 121, status: "aktif", joined: "24 Feb 2024" },
  { id: "SLR-0104", name: "Teras Kopi Filosofi", owner: "Bayu Anggara", city: "Malang", plan: "Gratis", sales: 9600000, orders: 33, status: "belum verifikasi", joined: "17 Feb 2024" },
];

export const PREMIUM_REQUESTS = [
  { id: "PRM-0091", seller: "Batik Laweyan Solo", plan: "Premium Tahunan", amount: 588000, date: "12 Feb 2025", proof: "BCA transfer", status: "menunggu" },
  { id: "PRM-0090", seller: "Anyaman Lombok", plan: "Premium Bulanan", amount: 59000, date: "12 Feb 2025", proof: "QRIS", status: "menunggu" },
  { id: "PRM-0089", seller: "Kriya Nusa Craft", plan: "Premium Tahunan", amount: 588000, date: "11 Feb 2025", proof: "Mandiri", status: "disetujui" },
  { id: "PRM-0088", seller: "Snack Box Jaksel", plan: "Premium Bulanan", amount: 59000, date: "10 Feb 2025", proof: "QRIS", status: "ditolak" },
];

export const WITHDRAWALS = [
  { id: "WDR-0428", seller: "Dapoer Bu Ani", bank: "BCA", acct: "•••• 4821", amount: 1250000, fee: 6500, date: "11 Feb 2025", status: "selesai" },
  { id: "WDR-0427", seller: "Kriya Nusa Craft", bank: "BNI", acct: "•••• 9012", amount: 4300000, fee: 6500, date: "11 Feb 2025", status: "diproses" },
  { id: "WDR-0426", seller: "Anyaman Lombok", bank: "Mandiri", acct: "•••• 3345", amount: 875000, fee: 6500, date: "10 Feb 2025", status: "menunggu" },
  { id: "WDR-0425", seller: "Batik Laweyan Solo", bank: "BRI", acct: "•••• 7781", amount: 2150000, fee: 6500, date: "10 Feb 2025", status: "selesai" },
  { id: "WDR-0424", seller: "Snack Box Jaksel", bank: "BCA", acct: "•••• 1120", amount: 420000, fee: 6500, date: "9 Feb 2025", status: "ditolak" },
];

export const PAYMENTS = [
  { id: "PYM-77120", store: "Dapoer Bu Ani", channel: "QRIS", amount: 96000, fee: 720, time: "12 Feb 09:12", status: "berhasil" },
  { id: "PYM-77119", store: "Kriya Nusa Craft", channel: "QRIS", amount: 486000, fee: 3645, time: "12 Feb 08:54", status: "berhasil" },
  { id: "PYM-77118", store: "Batik Laweyan Solo", channel: "Transfer manual", amount: 1250000, fee: 0, time: "12 Feb 08:31", status: "cocok" },
  { id: "PYM-77117", store: "Snack Box Jaksel", channel: "QRIS", amount: 152000, fee: 1140, time: "12 Feb 07:48", status: "gagal" },
  { id: "PYM-77116", store: "Anyaman Lombok", channel: "QRIS", amount: 734000, fee: 5505, time: "11 Feb 22:03", status: "berhasil" },
  { id: "PYM-77115", store: "Teras Kopi Filosofi", channel: "Transfer manual", amount: 320000, fee: 0, time: "11 Feb 21:15", status: "perlu cek" },
];

export const ADMIN_USERS = [
  { id: "USR-30142", name: "Ani Rahayu", email: "ani@dapoerbuani.id", role: "Penjual", last: "12 Feb 2025, 09:44", status: "aktif" },
  { id: "USR-30138", name: "Melati Kusuma", email: "melati@kriyanusa.com", role: "Penjual", last: "12 Feb 2025, 08:02", status: "aktif" },
  { id: "USR-30120", name: "Dwi Handoko", email: "dwi@tokolink.id", role: "Admin", last: "12 Feb 2025, 07:10", status: "aktif" },
  { id: "USR-30098", name: "Fajar Nugroho", email: "fajar@snackbox.id", role: "Penjual", last: "8 Feb 2025, 16:20", status: "ditangguhkan" },
  { id: "USR-30077", name: "Siti Aminah", email: "siti@anyamanlombok.id", role: "Penjual", last: "11 Feb 2025, 19:55", status: "aktif" },
];

export const FAQ = [
  {
    q: "Saya tidak bisa bikin website. Apa ini sulit?",
    a: "Tidak. Anda cukup isi nama toko, unggah foto produk, dan TokoLink membuat halaman toko jadi. Rata-rata penjual selesai dalam 10 menit, langsung dari HP.",
  },
  {
    q: "Bagaimana pembeli membayar?",
    a: "Pembeli memindai QRIS di halaman toko Anda, atau memakai transfer bank yang tercantum. Uang masuk ke saldo TokoLink dan bisa Anda tarik ke rekening mana pun.",
  },
  {
    q: "Apakah ada biaya per transaksi?",
    a: "Paket Gratis tidak ada biaya bulanan, hanya biaya layanan QRIS 0,7% dari nilai transaksi. Paket Premium memangkas biaya layanan menjadi 0,5%.",
  },
  {
    q: "Kalau saya sudah punya toko di marketplace?",
    a: "TokoLink bukan pengganti, melainkan etalase utama. Taruh satu tautan di bio Instagram, WhatsApp, dan QR cetak, lalu arahkan pembeli ke sana.",
  },
  {
    q: "Apakah bisa dipakai untuk pre-order dan pesanan via WhatsApp?",
    a: "Bisa. Setiap produk punya tombol WhatsApp yang membuka chat dengan detail pesanan sudah terisi, jadi Anda tinggal konfirmasi stok.",
  },
  {
    q: "Kalau saya berhenti berlangganan?",
    a: "Toko tetap bisa dibuka di paket Gratis. Fitur Premium nonaktif, tetapi data produk dan pesanan Anda tidak dihapus.",
  },
];

/* ------------------------------ cart + toasts ----------------------------- */
export type CartItem = { id: string; qty: number };
type Toast = { id: number; msg: string; tone: "ok" | "info" | "warn" | "bad" };

type AppCtx = {
  cart: CartItem[];
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  toast: (msg: string, tone?: Toast["tone"]) => void;
  toasts: Toast[];
  dismiss: (id: number) => void;
  promo: string | null;
  setPromo: (p: string | null) => void;
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([{ id: "p1", qty: 1 }, { id: "p5", qty: 2 }]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [promo, setPromo] = useState<string | null>(null);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (msg: string, tone: Toast["tone"] = "ok") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, msg, tone }]);
      window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
    },
    [],
  );

  const add = useCallback((id: string, qty = 1) => {
    setCart((c) => {
      const found = c.find((x) => x.id === id);
      if (found) return c.map((x) => (x.id === id ? { ...x, qty: x.qty + qty } : x));
      return [...c, { id, qty }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setCart((c) =>
      qty <= 0 ? c.filter((x) => x.id !== id) : c.map((x) => (x.id === id ? { ...x, qty } : x)),
    );
  }, []);

  const clear = useCallback(() => setCart([]), []);

  const count = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  const value = useMemo(
    () => ({ cart, add, setQty, clear, count, toast, toasts, dismiss, promo, setPromo }),
    [cart, add, setQty, clear, count, toast, toasts, dismiss, promo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp harus dipakai di dalam AppProvider");
  return c;
}
