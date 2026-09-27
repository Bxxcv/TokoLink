import type { Product } from "./data";

/** Bentuk baris mentah tabel `products` Supabase (kolom sesuai database/schema.sql). */
export type DbProduct = {
  id: string;
  seller_id?: string;
  name: string;
  category: string;
  price: number | string;
  unit: string | null;
  image_url: string | null;
  stock: number;
  sku: string | null;
  sold: number;
  status: string;
  weight_gram: number | null;
  description: string | null;
};

/** Baris `products` Supabase → bentuk `Product` yang dipakai seluruh UI. */
export function mapProduct(r: DbProduct): Product {
  return {
    id: r.id,
    name: r.name,
    cat: r.category,
    price: Number(r.price),
    unit: r.unit ?? "",
    img: r.image_url ?? "images/p-lapis.jpg",
    stock: r.stock,
    sku: r.sku ?? "",
    sold: r.sold,
    status: r.status === "nonaktif" ? "nonaktif" : "aktif",
    weight: r.weight_gram ?? 0,
    desc: r.description ?? "",
  };
}
