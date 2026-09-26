import { useState, type ReactNode } from "react";
import { Link, navigate } from "../lib/router";
import { Logo, LogoMark, TagGlyph } from "../components/Logo";
import { Button, ButtonLink, Checkbox, Field, Icon, Input, cx } from "../components/ui";

function AuthLayout({
  index,
  kicker,
  title,
  lead,
  children,
  footer,
}: {
  index: string;
  kicker: string;
  title: string;
  lead: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[minmax(0,44%)_minmax(0,56%)]">
      {/* ---- brand panel ---- */}
      <aside className="relative hidden overflow-hidden bg-navy-900 p-10 lg:flex lg:flex-col">
        <div className="blueprint absolute inset-0 opacity-70" />
        <div className="absolute -bottom-24 -left-20 opacity-[0.06]">
          <LogoMark size={420} />
        </div>
        <div className="relative">
          <Link to="/" aria-label="TokoLink beranda">
            <Logo size={32} tone="dark" wordClass="text-brand-500" />
          </Link>
        </div>

        <div className="relative mt-auto max-w-md">
          <div className="micro mb-4 flex items-center gap-2.5 text-brand-400">
            <span className="text-white">{index}</span>
            <span className="h-px w-6 bg-brand-400/60" />
            <span>{kicker}</span>
          </div>
          <h1 className="text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white">{title}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/65">{lead}</p>

          <ul className="mt-8 space-y-3 border-t border-white/12 pt-6">
            {[
              "Toko aktif dalam 10 menit, tanpa kartu kredit",
              "Pembayaran QRIS resmi, dana bisa ditarik kapan saja",
              "Dibantu lewat WhatsApp pada jam kerja",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[14px] text-white/72">
                <TagGlyph size={15} className="mt-0.5 shrink-0 text-brand-400" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-10 flex items-center justify-between">
          <span className="micro text-white/55">© 2025 TokoLink</span>
          <span className="micro flex items-center gap-2 text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Sistem normal
          </span>
        </div>
      </aside>

      {/* ---- form panel ---- */}
      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4 lg:hidden">
          <Link to="/">
            <Logo size={28} />
          </Link>
          <Link to="/" className="text-[13.5px] font-semibold text-muted">
            Beranda
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[440px]">
            <div className="micro mb-3 flex items-center gap-2.5 text-brand-600">
              <span className="text-ink">{index}</span>
              <span className="h-px w-5 bg-brand-300" />
              <span>{kicker}</span>
            </div>
            <h2 className="text-[28px] font-extrabold tracking-[-0.03em] text-ink sm:text-[32px]">{title}</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{lead}</p>

            <div className="mt-7 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">{children}</div>

            <div className="mt-5 text-center text-[14px] text-muted">{footer}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------------------------- login --------------------------------- */
export function Login() {
  const [email, setEmail] = useState("ani@dapoerbuani.id");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email.includes("@")) return setErr("Masukkan alamat email yang benar.");
    if (pass.length < 6) return setErr("Kata sandi minimal 6 karakter.");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/app");
    }, 900);
  };

  return (
    <AuthLayout
      index="01"
      kicker="Masuk"
      title="Selamat datang kembali."
      lead="Masuk untuk mengurus pesanan, stok, dan saldo toko Anda."
      footer={
        <>
          Belum punya toko?{" "}
          <Link to="/register" className="font-bold text-brand-700 underline underline-offset-4">
            Daftar gratis
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email atau nomor WhatsApp" error={err}>
          <Input
            type="text"
            value={email}
            autoComplete="username"
            invalid={!!err}
            onChange={(e) => {
              setEmail(e.target.value);
              setErr("");
            }}
            placeholder="nama@contoh.com"
          />
        </Field>

        <Field label="Kata sandi">
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              value={pass}
              autoComplete="current-password"
              invalid={!!err}
              onChange={(e) => {
                setPass(e.target.value);
                setErr("");
              }}
              placeholder="Minimal 6 karakter"
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-faint hover:text-brand-700"
            >
              <Icon name="eye" size={17} />
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between gap-3 pt-1">
          <Checkbox checked={remember} onChange={setRemember}>
            Ingat saya di perangkat ini
          </Checkbox>
          <Link to="/forgot" className="text-[13.5px] font-semibold text-brand-700 hover:underline">
            Lupa kata sandi?
          </Link>
        </div>

        {err && (
          <div className="flex items-start gap-2.5 rounded-md border border-[#F6CFCF] bg-badsoft px-3.5 py-2.5 text-[13px] text-bad">
            <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
            {err}
          </div>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? "Memeriksa…" : "Masuk ke dasbor"}
        </Button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-line" />
          <span className="micro text-faint">atau</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <ButtonLink to="/app" variant="secondary" size="lg" className="w-full">
          <Icon name="wa" size={17} className="text-[#0a7a55]" /> Masuk lewat WhatsApp
        </ButtonLink>

        <p className="pt-1 text-center text-[12.5px] leading-relaxed text-faint">
          Demo prototipe: tekan <span className="font-semibold text-muted">Masuk ke dasbor</span> langsung
          untuk melihat halaman penjual.
        </p>
      </form>
    </AuthLayout>
  );
}

/* -------------------------------- register -------------------------------- */
export function Register() {
  const [name, setName] = useState("");
  const [store, setStore] = useState("");
  const [contact, setContact] = useState("");
  const [pass, setPass] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const slug =
    store
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 28) || "nama-toko";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 3) next.name = "Tulis nama lengkap Anda.";
    if (store.trim().length < 3) next.store = "Nama toko minimal 3 karakter.";
    if (!contact.includes("@") && contact.replace(/\D/g, "").length < 9)
      next.contact = "Masukkan email atau nomor WhatsApp yang aktif.";
    if (pass.length < 8) next.pass = "Kata sandi minimal 8 karakter.";
    if (!agree) next.agree = "Centang persetujuan untuk melanjutkan.";
    setErr(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/app");
    }, 1000);
  };

  return (
    <AuthLayout
      index="02"
      kicker="Daftar"
      title="Buka toko Anda hari ini."
      lead="Gratis, tanpa kartu kredit. Cuma perlu nama toko dan nomor yang bisa dihubungi."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link to="/login" className="font-bold text-brand-700 underline underline-offset-4">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Nama lengkap" error={err.name} required>
          <Input
            value={name}
            invalid={!!err.name}
            onChange={(e) => {
              setName(e.target.value);
              setErr((x) => ({ ...x, name: "" }));
            }}
            placeholder="Ani Rahayu"
          />
        </Field>

        <Field
          label="Nama toko"
          error={err.store}
          required
          hint={`Alamat toko Anda: tokolink.id/${slug}`}
        >
          <Input
            value={store}
            invalid={!!err.store}
            onChange={(e) => {
              setStore(e.target.value);
              setErr((x) => ({ ...x, store: "" }));
            }}
            placeholder="Dapoer Bu Ani"
          />
        </Field>

        <div className="notch-sm flex items-center justify-between gap-3 bg-brand-50 px-3.5 py-2.5">
          <span className="micro text-brand-700">Alamat tautan</span>
          <span className="tnum truncate text-[13px] font-semibold text-navy-800">tokolink.id/{slug}</span>
        </div>

        <Field label="Email atau nomor WhatsApp" error={err.contact} required>
          <Input
            value={contact}
            invalid={!!err.contact}
            onChange={(e) => {
              setContact(e.target.value);
              setErr((x) => ({ ...x, contact: "" }));
            }}
            placeholder="0812xxxxxxx"
          />
        </Field>

        <Field label="Kata sandi" error={err.pass} required hint="Minimal 8 karakter, campur angka dan huruf.">
          <Input
            type="password"
            value={pass}
            invalid={!!err.pass}
            onChange={(e) => {
              setPass(e.target.value);
              setErr((x) => ({ ...x, pass: "" }));
            }}
            placeholder="••••••••"
          />
        </Field>

        <div className={cx("rounded-md p-1", err.agree && "bg-badsoft")}>
          <Checkbox checked={agree} onChange={(v) => { setAgree(v); setErr((x) => ({ ...x, agree: "" })); }}>
            Saya setuju dengan Syarat Layanan dan Kebijakan Privasi TokoLink.
          </Checkbox>
          {err.agree && <div className="mt-1.5 pl-[28px] text-[12.5px] text-bad">{err.agree}</div>}
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? "Menyiapkan toko…" : "Buat toko gratis"}
        </Button>

        <p className="text-center text-[12.5px] leading-relaxed text-faint">
          Dengan mendaftar, nomor Anda hanya dipakai untuk notifikasi pesanan dan keamanan akun.
        </p>
      </form>
    </AuthLayout>
  );
}

/* ------------------------------ forgot password --------------------------- */
export function Forgot() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return setErr("Masukkan alamat email yang terdaftar.");
    setErr("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 900);
  };

  return (
    <AuthLayout
      index="03"
      kicker="Lupa kata sandi"
      title={sent ? "Tautan sudah dikirim." : "Atur ulang kata sandi."}
      lead={
        sent
          ? "Kami sudah mengirim tautan pengganti. Tautan berlaku 30 menit."
          : "Masukkan email yang terdaftar. Kami kirim tautan untuk mengganti kata sandi."
      }
      footer={
        <>
          Ingat kata sandi Anda?{" "}
          <Link to="/login" className="font-bold text-brand-700 underline underline-offset-4">
            Kembali masuk
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-oksoft text-ok">
            <Icon name="mail" size={26} />
          </div>
          <p className="mt-5 text-[15px] leading-relaxed text-ink">
            Cek kotak masuk <span className="font-bold">{email}</span> dan folder spam. Tautan reset ada di
            email dari <span className="font-bold">halo@tokolink.id</span>.
          </p>
          <div className="mt-6 space-y-2.5">
            <Button variant="secondary" className="w-full" onClick={() => setSent(false)}>
              <Icon name="refresh" size={16} /> Kirim ulang email
            </Button>
            <ButtonLink to="/login" className="w-full">
              Kembali ke halaman masuk
            </ButtonLink>
          </div>
          <p className="mt-4 text-[13px] text-faint">
            Tidak menerima email setelah 5 menit? Hubungi WhatsApp 0812-0000-0000.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Email terdaftar" error={err} required>
            <Input
              type="email"
              value={email}
              invalid={!!err}
              onChange={(e) => {
                setEmail(e.target.value);
                setErr("");
              }}
              placeholder="nama@contoh.com"
              autoComplete="email"
            />
          </Field>
          <Button type="submit" size="lg" loading={loading} className="w-full">
            {loading ? "Mengirim…" : "Kirim tautan reset"}
          </Button>
          <div className="rounded-md border border-line bg-canvas p-3.5">
            <div className="flex items-start gap-2.5">
              <Icon name="info" size={16} className="mt-0.5 shrink-0 text-brand-600" />
              <p className="text-[13px] leading-relaxed text-muted">
                Kata sandi lama tetap berlaku sampai Anda menggantinya lewat tautan yang kami kirim.
              </p>
            </div>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
