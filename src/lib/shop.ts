/**
 * Tipe domain toko (dipakai bareng data Supabase, bukan mock).
 * Produk/pesanan asli datang dari database via mapProduct / query —
 * tipe ini cuma bentuknya.
 */
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

/** Kategori pilihan di form produk (nilai bebas tetap boleh disimpan). */
export const CATEGORIES = ["Semua", "Kue & Snack", "Sambal & Bumbu", "Kopi & Minuman", "Panen & Herbal"];

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
  phone?: string;
  address?: string;
  note?: string;
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  menunggu: "Menunggu bayar",
  dikemas: "Sedang dikemas",
  dikirim: "Dalam pengiriman",
  selesai: "Selesai",
  batal: "Dibatalkan",
};
