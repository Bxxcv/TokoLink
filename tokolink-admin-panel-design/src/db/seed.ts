// Seed data demo untuk Admin Master. Deterministik (PRNG ber-benih).
// Jalankan: RUN_SEED=1 npx tsx src/db/seed.ts
import "dotenv/config";
import { db } from "./index";
import {
  auditLog,
  broadcasts,
  payments,
  premiumRequests,
  settings,
  stores,
  users,
  withdrawals,
} from "./schema";

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NOW = Date.now();
const daysAgo = (d: number) => new Date(NOW - d * 86400000);
const hoursAgo = (h: number) => new Date(NOW - h * 3600000);

export async function reseedDemo() {
  const rnd = mulberry32(20260214);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)]!;
  const int = (min: number, max: number) =>
    Math.floor(rnd() * (max - min + 1)) + min;

  await db.delete(payments);
  await db.delete(premiumRequests);
  await db.delete(withdrawals);
  await db.delete(broadcasts);
  await db.delete(auditLog);
  await db.delete(users);
  await db.delete(stores);
  await db.delete(settings);

  // ── Toko ────────────────────────────────────────────────────────────
  const storeDefs = [
    { name: "Kopi Senja", slug: "kopisenja", owner: "Aldo Pratama", phone: "+62 812-3456-1101", city: "Bandung", plan: "premium", status: "active", products: 18, joined: 152, lastActive: 0, items: ["Kopi Arabika 250 g", "Kopi Gayo 200 g", "Cold Brew Concentrate", "Saset Kopi ×10"] },
    { name: "Dapur Bu Rina", slug: "dapurburina", owner: "Rina Marlina", phone: "+62 813-8821-4407", city: "Jakarta Barat", plan: "premium", status: "active", products: 32, joined: 131, lastActive: 0, items: ["Nasi Padang Komplit", "Ayam Bakar + Lado", "Gulai Tunjang", "Es Teh Peh Liang"] },
    { name: "Baju Iwan", slug: "bajuiwan", owner: "Iwan Setiawan", phone: "+62 811-3902-7715", city: "Surabaya", plan: "free", status: "active", products: 45, joined: 98, lastActive: 1, items: ["Kaos Lengan Panjang", "Flannel Oversize", "Celana Chino", "Jaket Bomber"] },
    { name: "Kue Mama Tuti", slug: "kuemamauti", owner: "Tuti Handayani", phone: "+62 821-4410-9382", city: "Yogyakarta", plan: "free", status: "pending", products: 12, joined: 9, lastActive: 0, items: ["Brownies Cokelat", "Kue Cubit ×6", "Pudding Gula Aren", "Donat Glaze ×6"] },
    { name: "Aksesoris Rani", slug: "aksesorisrani", owner: "Rani Puspita", phone: "+62 812-7734-2210", city: "Bandung", plan: "premium", status: "active", products: 27, joined: 112, lastActive: 0, items: ["Anting Mutiara", "Kalung Rantai", "Gelang Manik", "Cincin Ename"] },
    { name: "Hijab Naura", slug: "hijabnaura", owner: "Naura Azzahra", phone: "+62 852-9903-1188", city: "Makassar", plan: "free", status: "active", products: 60, joined: 87, lastActive: 2, items: ["Hijab Voal", "Bavari Jersey", "Inner Terusan", "Bros Kristal"] },
    { name: "Kado Ayu", slug: "kadofayu", owner: "Ayu Lestari", phone: "+62 813-6675-0043", city: "Medan", plan: "free", status: "suspended", products: 9, joined: 64, lastActive: 21, items: ["Kado Ulang Tahun", "Buket Snack", "Plakat Acrylic"] },
    { name: "Elektronik Pak Dodi", slug: "elekdpakdodi", owner: "Dodi Kurniawan", phone: "+62 811-2288-4561", city: "Jakarta Timur", plan: "free", status: "active", products: 21, joined: 76, lastActive: 0, items: ["Bluetooth Speaker", "Powerbank 20.000 mAh", "Earbuds TWS", "Lampu LED Ring"] },
    { name: "Skincare Luma", slug: "skincareluma", owner: "Sekar Larasati", phone: "+62 819-3345-7821", city: "Denpasar", plan: "premium", status: "active", products: 15, joined: 105, lastActive: 0, items: ["Serum Brightening", "Sunscreen SPF 50", "Facial Foam", "Masker Sheet ×5"] },
    { name: "Nusantara Bean Co.", slug: "nusabean", owner: "Fajar Siregar", phone: "+62 812-6641-9903", city: "Medan", plan: "free", status: "active", products: 11, joined: 58, lastActive: 3, items: ["Green Bean 500 g", "House Blend 250 g", "Kopi Tubruk", "Moka Pot"] },
    { name: "Keju Meli", slug: "kejumeli", owner: "Melati Sari", phone: "+62 856-1120-3348", city: "Yogyakarta", plan: "free", status: "active", products: 8, joined: 41, lastActive: 0, items: ["Keju Stick ×10", "Chili Cheese ×8", "Sourdough Mini"] },
    { name: "Kayu Jati Furniture", slug: "kayujati", owner: "Bambang Sutrisno", phone: "+62 813-2277-6654", city: "Semarang", plan: "free", status: "pending", products: 14, joined: 6, lastActive: 0, items: ["Kursi Jati Solid", "Meja Kerja 120", "Rak Buku 5 Laci", "Hammock Ganda"] },
    { name: "Bunga Cantik Florist", slug: "bungetcantik", owner: "Siti Rahmawati", phone: "+62 812-9981-2247", city: "Malang", plan: "free", status: "active", products: 19, joined: 49, lastActive: 1, items: ["Mawar Merah ×11", "Buket Perayaan", "Bunga Meja", "Kartu Ucapan"] },
    { name: "Keripik Rajasa", slug: "keripikrajasa", owner: "Andi Rajasa", phone: "+62 811-5540-8892", city: "Palembang", plan: "free", status: "active", products: 7, joined: 33, lastActive: 0, items: ["Keripik Pisang 250 g", "Keripik Singkong Pedas", "Talpuku", "Paket Hampers Snack"] },
  ];

  const storeRows = await db
    .insert(stores)
    .values(
      storeDefs.map((s) => ({
        name: s.name,
        slug: s.slug,
        owner: s.owner,
        phone: s.phone,
        city: s.city,
        plan: s.plan,
        status: s.status,
        products: s.products,
        joinedAt: daysAgo(s.joined),
        lastActiveAt: s.lastActive <= 0 ? new Date(NOW - int(1, 20) * 3600000) : daysAgo(s.lastActive),
      })),
    )
    .returning();

  const storeId = (slug: string) => storeRows.find((r) => r.slug === slug)!.id;

  // ── Pengguna ─────────────────────────────────────────────────────────
  const buyerDefs = [
    ["Dewi Anggraini", "dewi.anggr@gmail.com"],
    ["Rizky Ramadhan", "rizky.rdz@gmail.com"],
    ["Salsabila Putri", "salsa.putri@ymail.com"],
    ["Hendra Wijaya", "hendra.wijaya@gmail.com"],
    ["Intan Permata", "intan.permata@gmail.com"],
    ["Yoga Pratama", "yoga.prt@gmail.com"],
    ["Maya Kurnia", "maya.kurnia@gmail.com"],
    ["Bimo Aditya", "bimo.aditya@gmail.com"],
  ];

  await db.insert(users).values([
    {
      name: "Muhammad Farid",
      email: "bxxcv@tokolink.id",
      phone: "+62 811-1234-5678",
      role: "admin",
      status: "active",
      lastLoginAt: hoursAgo(2),
      createdAt: daysAgo(410),
    },
    ...storeDefs.map((s) => ({
      name: s.owner,
      email: s.slug + "@gmail.com",
      phone: s.phone,
      role: "seller" as const,
      status: s.status === "suspended" ? ("suspended" as const) : ("active" as const),
      lastLoginAt: daysAgo(int(0, 18)),
      createdAt: daysAgo(s.joined),
    })),
    ...buyerDefs.map(([name, email], i) => ({
      name,
      email,
      phone: "+62 81" + int(10, 99) + "-" + int(1000, 9999) + "-" + int(1000, 9999),
      role: "buyer" as const,
      status: "active" as const,
      lastLoginAt: i === 3 ? daysAgo(45) : daysAgo(int(0, 25)),
      createdAt: daysAgo(int(20, 320)),
    })),
  ]);

  // ── Pembayaran ───────────────────────────────────────────────────────
  const payRows: {
    invoiceNo: string;
    storeId: string;
    storeName: string;
    item: string;
    amount: number;
    fee: number;
    method: string;
    status: string;
    createdAt: Date;
  }[] = [];
  let seq = 1;
  for (const s of storeDefs) {
    if (s.status === "suspended") {
      // toko suspend: transaksi hanya di masa lalu
      for (let i = 0; i < 5; i++) {
        const created = daysAgo(int(22, 45));
        const amount = int(18, 320) * 1000;
        payRows.push({
          invoiceNo: `TLK-${created.toISOString().slice(2, 7).replace("-", "")}-${String(seq++).padStart(4, "0")}`,
          storeId: storeId(s.slug),
          storeName: s.name,
          item: pick(s.items),
          amount,
          fee: Math.round(amount * 0.025),
          method: rnd() < 0.7 ? "qris" : "transfer",
          status: "paid",
          createdAt: created,
        });
      }
      continue;
    }
    const vol = s.plan === "premium" ? int(10, 15) : int(4, 9);
    for (let i = 0; i < vol; i++) {
      const dAgo = Math.floor(Math.pow(rnd(), 1.5) * 44);
      const created = new Date(NOW - dAgo * 86400000 - int(0, 82000) * 1000);
      let amount = int(18, 420) * 1000;
      if (rnd() < 0.12) amount *= int(2, 4);
      const r = rnd();
      const r2 = rnd();
      payRows.push({
        invoiceNo: `TLK-${created.toISOString().slice(2, 7).replace("-", "")}-${String(seq++).padStart(4, "0")}`,
        storeId: storeId(s.slug),
        storeName: s.name,
        item: pick(s.items),
        amount,
        fee: Math.round(amount * 0.025),
        method: r2 < 0.6 ? "qris" : r2 < 0.88 ? "transfer" : "ewallet",
        status: r < 0.86 ? "paid" : r < 0.93 && dAgo < 3 ? "pending" : r < 0.93 ? "paid" : "failed",
        createdAt: created,
      });
    }
  }
  payRows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  await db.insert(payments).values(payRows);

  // ── Permintaan premium ───────────────────────────────────────────────
  await db.insert(premiumRequests).values([
    { storeId: storeId("bajuiwan"), storeName: "Baju Iwan", period: "bulanan", price: 99000, proof: "bukti_qris_bajuiwan.png", note: "Mohon segera, mau pakai template baru bulan ini.", status: "pending", requestedAt: hoursAgo(3) },
    { storeId: storeId("hijabnaura"), storeName: "Hijab Naura", period: "tahunan", price: 990000, proof: "bukti_transfer_hijabnaura.jpg", note: "Pakai promo tahunan.", status: "pending", requestedAt: hoursAgo(26) },
    { storeId: storeId("nusabean"), storeName: "Nusantara Bean Co.", period: "bulanan", price: 99000, proof: "bukti_qris_nusabean.png", status: "pending", requestedAt: hoursAgo(50) },
    { storeId: storeId("kejumeli"), storeName: "Keju Meli", period: "bulanan", price: 99000, proof: "bukti_qris_kejumeli.png", note: "Beli lewat m-banking, tolong dicek.", status: "pending", requestedAt: hoursAgo(74) },
    { storeId: storeId("kuemamauti"), storeName: "Kue Mama Tuti", period: "tahunan", price: 990000, proof: "bukti_transfer_kuemamauti.jpg", status: "pending", requestedAt: hoursAgo(96) },
    { storeId: storeId("dapurburina"), storeName: "Dapur Bu Rina", period: "bulanan", price: 99000, proof: "bukti_qris_dapurburina.png", status: "approved", requestedAt: daysAgo(15), resolvedAt: daysAgo(14.5), resolvedNote: "Pembayaran QRIS terverifikasi otomatis." },
    { storeId: storeId("aksesorisrani"), storeName: "Aksesoris Rani", period: "bulanan", price: 99000, proof: "bukti_qris_aksesorisrani.png", status: "approved", requestedAt: daysAgo(31), resolvedAt: daysAgo(30), resolvedNote: "Pembayaran QRIS terverifikasi otomatis." },
    { storeId: storeId("kadofayu"), storeName: "Kado Ayu", period: "bulanan", price: 99000, proof: "bukti_buram.jpg", status: "rejected", requestedAt: daysAgo(21), resolvedAt: daysAgo(20), resolvedNote: "Bukti pembayaran tidak terbaca, mohon kirim ulang." },
    { storeId: storeId("skincareluma"), storeName: "Skincare Luma", period: "tahunan", price: 990000, proof: "bukti_transfer_skincareluma.jpg", status: "approved", requestedAt: daysAgo(91), resolvedAt: daysAgo(90), resolvedNote: "Transfer terverifikasi, paket tahunan aktif." },
  ]);

  // ── Penarikan dana ───────────────────────────────────────────────────
  await db.insert(withdrawals).values([
    { storeId: storeId("kopisenja"), storeName: "Kopi Senja", amount: 2450000, bank: "BCA", accountNo: "8830 1174 21 (Aldo P.)", status: "pending", requestedAt: hoursAgo(5) },
    { storeId: storeId("dapurburina"), storeName: "Dapur Bu Rina", amount: 3780000, bank: "BRI", accountNo: "0021 0334 8890 52 (Rina M.)", status: "pending", requestedAt: hoursAgo(29) },
    { storeId: storeId("skincareluma"), storeName: "Skincare Luma", amount: 1120000, bank: "Mandiri", accountNo: "1370 0092 4417 88 (Sekar L.)", status: "pending", requestedAt: hoursAgo(51) },
    { storeId: storeId("elekdpakdodi"), storeName: "Elektronik Pak Dodi", amount: 940000, bank: "BCA", accountNo: "3218 6640 7751 (Dodi K.)", status: "pending", requestedAt: hoursAgo(76) },
    { storeId: storeId("bajuiwan"), storeName: "Baju Iwan", amount: 620000, bank: "BCA", accountNo: "8830 5512 9904 (Iwan S.)", status: "processed", requestedAt: daysAgo(12.5), resolvedAt: daysAgo(12), resolvedNote: "Dana dikirim, estimasi cair 1x24 jam." },
    { storeId: storeId("kopisenja"), storeName: "Kopi Senja", amount: 1875000, bank: "BCA", accountNo: "8830 1174 21 (Aldo P.)", status: "processed", requestedAt: daysAgo(8.5), resolvedAt: daysAgo(8), resolvedNote: "Dana dikirim via transfer." },
    { storeId: storeId("kejumeli"), storeName: "Keju Meli", amount: 500000, bank: "BNI", accountNo: "0485 1102 3398 (Melati S.)", status: "rejected", requestedAt: daysAgo(10.5), resolvedAt: daysAgo(10), resolvedNote: "Nomor rekening tidak cocok dengan identitas terverifikasi." },
    { storeId: storeId("hijabnaura"), storeName: "Hijab Naura", amount: 2140000, bank: "BRI", accountNo: "0026 4410 9023 17 (Naura A.)", status: "processed", requestedAt: daysAgo(18.5), resolvedAt: daysAgo(18), resolvedNote: "Dana dikirim via transfer." },
  ]);

  // ── Broadcast ────────────────────────────────────────────────────────
  await db.insert(broadcasts).values([
    { title: "Jadwal pemeliharaan sistem", message: "TokoLink akan melakukan pemeliharaan Sabtu 02.00–04.00 WIB. Checkout mungkin terdampak selama ±30 menit. Terima kasih sudah sabar!", segment: "all", status: "sent", recipients: 13, sentAt: daysAgo(5), createdBy: "Muhammad Farid" },
    { title: "Fitur baru: QRIS di semua checkout", message: "Sekarang pembeli bisa scan QRIS dari semua tema storefront, termasuk halaman produk dan keranjang. Tidak perlu melakukan apa pun — langsung aktif.", segment: "all", status: "sent", recipients: 12, sentAt: daysAgo(12), createdBy: "Muhammad Farid" },
    { title: "Promo akhir bulan: gratis ongkir", message: "Toko paket Premium terpilih untuk program gratis ongkir akhir bulan. Penawaran muncul otomatis di halaman toko Anda pada tanggal 28.", segment: "premium", status: "draft", recipients: 0, sentAt: null, createdBy: "Muhammad Farid" },
  ]);

  // ── Audit log ────────────────────────────────────────────────────────
  const actor = "Muhammad Farid";
  await db.insert(auditLog).values([
    { actor, action: "Login admin", target: "Akun admin", detail: "Login berhasil dari 36.85.112.4 (Jakarta, ID)", amount: null, createdAt: hoursAgo(2) },
    { actor, action: "Login admin", target: "Akun admin", detail: "Login berhasil dari 36.85.112.4 (Jakarta, ID)", amount: null, createdAt: daysAgo(1) },
    { actor, action: "Mode maintenance dimatikan", target: "Sistem", detail: "Pemeliharaan selesai, semua layanan normal kembali.", amount: null, createdAt: daysAgo(5) },
    { actor, action: "Pengumuman terkirim", target: "Broadcast", detail: "“Jadwal pemeliharaan sistem” dikirim ke 13 toko.", amount: null, createdAt: daysAgo(5) },
    { actor, action: "Mode maintenance diaktifkan", target: "Sistem", detail: "Pesan: “Pemeliharaan terjadwal 02.00–04.00 WIB”", amount: null, createdAt: daysAgo(5.2) },
    { actor, action: "Tarik dana ditolak", target: "Keju Meli", detail: "Nomor rekening tidak cocok dengan identitas terverifikasi.", amount: 500000, createdAt: daysAgo(10) },
    { actor, action: "Tarik dana diproses", target: "Baju Iwan", detail: "Dana dikirim via transfer ke BCA •• 9904.", amount: 620000, createdAt: daysAgo(12) },
    { actor, action: "Fee platform diubah", target: "Pengaturan", detail: "Fee transaksi diubah dari 2,0% menjadi 2,5%.", amount: null, createdAt: daysAgo(14) },
    { actor, action: "Upgrade premium disetujui", target: "Dapur Bu Rina", detail: "Paket bulanan — pembayaran QRIS terverifikasi.", amount: 99000, createdAt: daysAgo(14.5) },
    { actor, action: "Upgrade premium disetujui", target: "Aksesoris Rani", detail: "Paket bulanan — pembayaran QRIS terverifikasi.", amount: 99000, createdAt: daysAgo(30) },
    { actor, action: "Toko ditangguhkan", target: "Kado Ayu", detail: "Laporan pembeli: produk tidak dikirim 3x berturut-turut.", amount: null, createdAt: daysAgo(21) },
    { actor, action: "Upgrade premium disetujui", target: "Skincare Luma", detail: "Paket tahunan — transfer bank terverifikasi.", amount: 990000, createdAt: daysAgo(90) },
  ]);

  // ── Pengaturan ───────────────────────────────────────────────────────
  await db.insert(settings).values([
    { key: "maintenance", value: "off" },
    { key: "maintenance_message", value: "Pemeliharaan terjadwal. Toko kembali normal sebentar lagi." },
    { key: "fee_pct", value: "2.5" },
  ]);
}

if (process.env.RUN_SEED === "1") {
  reseedDemo()
    .then(() => {
      console.log("✔ Seed data demo selesai.");
      process.exit(0);
    })
    .catch((e) => {
      console.error("✖ Gagal seed:", e);
      process.exit(1);
    });
}
