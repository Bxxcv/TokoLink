# Template Email TokoLink (Supabase Auth → Emails → Templates)

Cara pakai: buka tiap template → ganti **Subject** + **Content** dengan
kode di bawah → Save. Variabel `{{ .ConfirmationURL }}` WAJIB ada
(jangan dihapus/diubah) — itu link verifikasinya.
Banner: `https://www.tokolink.store/images/twitter_meta/twitter_card.jpg`.

---

## 1. Confirm signup

**Subject:** `Satu klik lagi, tokomu jadi! 🎉`

**Content (HTML):**

```html
<div style="margin:0;padding:0;background:#F2F5F9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#0B2E6E;border-radius:14px 14px 0 0;padding:20px 24px;text-align:center;">
      <div style="color:#fff;font-size:22px;font-weight:bold;">TokoLink</div>
      <div style="color:#9CC3FF;font-size:13px;margin-top:4px;">Satu link untuk semua jualanmu</div>
    </div>
    <img src="https://www.tokolink.store/images/twitter_meta/twitter_card.jpg" alt="TokoLink" style="display:block;width:100%;height:auto;" />
    <div style="background:#fff;border-radius:0 0 14px 14px;padding:28px 24px;text-align:center;">
      <div style="font-size:20px;font-weight:bold;color:#0B2E6E;">Halo, calon juragan! 👋</div>
      <p style="font-size:14px;line-height:1.7;color:#46566F;margin:14px 0 0;">
        Akun tokomu sudah dibuat. Tinggal <b>satu klik</b> buat verifikasi
        email ini, habis itu langsung bisa tambah produk dan terima QRIS.
      </p>
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;margin:22px 0 6px;background:#0A69C4;color:#fff;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 34px;border-radius:10px;">
        Verifikasi Email Saya
      </a>
      <p style="font-size:12px;color:#8A94A0;margin:14px 0 0;">
        Tombol tidak bisa diklik? Salin tautan ini ke browser:<br />
        <span style="word-break:break-all;">{{ .ConfirmationURL }}</span>
      </p>
    </div>
    <p style="text-align:center;font-size:12px;color:#8A94A0;margin:16px 0 0;">
      Butuh bantuan? WA 085191245042 · supporttokolink@gmail.com<br />
      © 2026 TokoLink
    </p>
  </div>
</div>
```

---

## 2. Reset password

**Subject:** `Atur ulang kata sandimu (30 menit ya!)`

**Content (HTML):**

```html
<div style="margin:0;padding:0;background:#F2F5F9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#0B2E6E;border-radius:14px 14px 0 0;padding:20px 24px;text-align:center;">
      <div style="color:#fff;font-size:22px;font-weight:bold;">TokoLink</div>
      <div style="color:#9CC3FF;font-size:13px;margin-top:4px;">Satu link untuk semua jualanmu</div>
    </div>
    <img src="https://www.tokolink.store/images/twitter_meta/twitter_card.jpg" alt="TokoLink" style="display:block;width:100%;height:auto;" />
    <div style="background:#fff;border-radius:0 0 14px 14px;padding:28px 24px;text-align:center;">
      <div style="font-size:20px;font-weight:bold;color:#0B2E6E;">Lupa sandi? Santai 😌</div>
      <p style="font-size:14px;line-height:1.7;color:#46566F;margin:14px 0 0;">
        Klik tombol di bawah buat bikin kata sandi baru.
        Tautan ini <b>hangus dalam 30 menit</b> — kalau telat, minta lagi
        dari halaman lupa sandi.
      </p>
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;margin:22px 0 6px;background:#0A69C4;color:#fff;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 34px;border-radius:10px;">
        Buat Sandi Baru
      </a>
      <p style="font-size:12px;color:#8A94A0;margin:14px 0 0;">
        Tidak merasa minta ini? Abaikan saja, sandi lamamu tetap berlaku.
      </p>
    </div>
    <p style="text-align:center;font-size:12px;color:#8A94A0;margin:16px 0 0;">
      Butuh bantuan? WA 085191245042 · supporttokolink@gmail.com<br />
      © 2026 TokoLink
    </p>
  </div>
</div>
```

---

**Yang TIDAK perlu diubah:** Magic link, Invite user, Change email,
Reauthentication (tidak dipakai aplikasi). Toggle Security biarkan mati.
