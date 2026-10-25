import { ButtonLink } from "../components/ui";

export default function Maintenance() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy-900 px-6 text-center">
      <div className="blueprint absolute inset-0 opacity-70" />
      <div className="relative flex flex-col items-center">
        <span className="micro mb-6 flex items-center gap-2.5 text-brand-400">
          <span className="text-white">MAINTENANCE</span>
          <span className="h-px w-6 bg-brand-400/60" />
          <span>Sementara ditutup</span>
        </span>
        <h1 className="max-w-xl text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:text-[42px]">
          TokoLink sedang dalam pemeliharaan.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
          Kami sedang memperbaiki sistem agar lebih stabil. Semua halaman toko
          dan dashboard sementara tidak tersedia. Terima kasih atas kesabaran Anda.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="https://wa.me/6285191245042"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-6 py-3 text-[15px] font-bold text-navy-900 hover:bg-brand-400"
          >
            WhatsApp Admin
          </a>
          <a
            href="mailto:supporttokolink@gmail.com"
            className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-transparent px-6 py-3 text-[15px] font-bold text-white hover:border-white/60 hover:bg-white/10"
          >
            Email Admin
          </a>
        </div>
        <p className="mt-8 text-[13px] text-white/45">
          WhatsApp: 0851-9124-5042 · Email: supporttokolink@gmail.com
        </p>
      </div>
    </div>
  );
}
