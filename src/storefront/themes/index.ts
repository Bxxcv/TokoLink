/**
 * Peta ID tema → komponen presentasi. StoreHome cukup tulis:
 *   const C = ENGINE_COMPONENTS[themeId] ?? null;
 * Tema "klasik" tidak ada di sini (dirender JSX bawaan lama).
 */
import type { ComponentType } from "react";
import type { ThemeStorefrontProps } from "../types";
import { RuangSeduh } from "./ruang-seduh";
import { PasarRapi } from "./pasar-rapi";
import { LugasJasa } from "./lugas-jasa";
import { Atelier } from "./atelier";
import { DapurHariIni } from "./dapur-hari-ini";
import { KriyaNusantara } from "./kriya-nusantara";
import { PixelGoods } from "./pixel-goods";
import { StudioTenang } from "./studio-tenang";

export const ENGINE_COMPONENTS: Record<string, ComponentType<ThemeStorefrontProps>> = {
  "ruang-seduh": RuangSeduh,
  "pasar-rapi": PasarRapi,
  "lugas-jasa": LugasJasa,
  atelier: Atelier,
  "dapur-hari-ini": DapurHariIni,
  "kriya-nusantara": KriyaNusantara,
  "pixel-goods": PixelGoods,
  "studio-tenang": StudioTenang,
};
