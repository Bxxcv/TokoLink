import { supabase } from "./supabase";

/** Unggah gambar ke bucket "tokolink" di folder milik seller.
 *  Mengembalikan URL publik. Throw "not-image" / "too-big" / Error supabase. */
export async function uploadImage(userId: string, file: File, name: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("not-image");
  if (file.size > 2 * 1024 * 1024) throw new Error("too-big");
  const ext = file.name.split(".").pop()?.toLowerCase() === "png" ? "png" : "jpg";
  const path = `${userId}/${name}.${ext}`;
  const { error } = await supabase.storage.from("tokolink").upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from("tokolink").getPublicUrl(path).data.publicUrl;
}
