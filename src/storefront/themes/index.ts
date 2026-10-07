/**
 * Peta ID tema → komponen presentasi. StoreHome cukup tulis:
 *   const C = ENGINE_COMPONENTS[themeId] ?? null;
 * Tema "klasik" tidak ada di sini (dirender JSX bawaan lama).
 * Set 8 tema baru (Okt 2026) — lihat Hasil_Repair/Brief_Desain_Tema.md.
 */
import type { ComponentType } from "react";
import type { ThemeStorefrontProps } from "../types";
import { WarungRame } from "./warung-rame";
import { KopiSore } from "./kopi-sore";
import { ButikRapi } from "./butik-rapi";
import { JasaKilat } from "./jasa-kilat";
import { DapurNgebul } from "./dapur-ngebul";
import { KriyaAsli } from "./kriya-asli";
import { DigitalKilat } from "./digital-kilat";
import { KonsultanTenang } from "./konsultan-tenang";

export const ENGINE_COMPONENTS: Record<string, ComponentType<ThemeStorefrontProps>> = {
  "warung-rame": WarungRame,
  "kopi-sore": KopiSore,
  "butik-rapi": ButikRapi,
  "jasa-kilat": JasaKilat,
  "dapur-ngebul": DapurNgebul,
  "kriya-asli": KriyaAsli,
  "digital-kilat": DigitalKilat,
  "konsultan-tenang": KonsultanTenang,
};
