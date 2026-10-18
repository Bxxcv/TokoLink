import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { useRoute, Link } from "../lib/router";
import { PageShell, Button, Input, Textarea, Card, ButtonLink, Field, cx } from "../components/ui";
import { Logo } from "../components/Logo";

type Msg = { id: string; sender_type: string; body: string; created_at: string };

export default function Chat() {
  const { user } = useAuth();
  const route = useRoute();
  const params = new URLSearchParams(route.split("?")[1] ?? "");
  const storeParam = params.get("store");
  const tokenParam = params.get("token");

  // Buyer mode
  const [buyerStore, setBuyerStore] = useState(storeParam ?? "");
  const [buyerToken, setBuyerToken] = useState(tokenParam ?? "");
  const [buyerThread, setBuyerThread] = useState<string | null>(null);
  const [buyerMsgs, setBuyerMsgs] = useState<Msg[]>([]);
  const [buyerText, setBuyerText] = useState("");
  const [buyerErr, setBuyerErr] = useState("");
  const [buyerLoading, setBuyerLoading] = useState(false);

  // Seller mode
  const [threads, setThreads] = useState<{ id: string; store_id: string; last_message_at: string }[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [sellerMsgs, setSellerMsgs] = useState<Msg[]>([]);
  const [sellerText, setSellerText] = useState("");
  const [sellerLoading, setSellerLoading] = useState(false);

  const loadBuyerThread = async (tid: string) => {
    const { data } = await supabase.from("chat_messages").select("id,sender_type,body,created_at").eq("thread_id", tid).order("created_at");
    setBuyerMsgs((data ?? []) as Msg[]);
  };

  const openBuyerChat = async () => {
    setBuyerErr("");
    if (!buyerStore || !buyerToken || !buyerText.trim()) { setBuyerErr("Isi toko, token pesanan, dan pesan."); return; }
    setBuyerLoading(true);
    try {
      const { data, error } = await supabase.rpc("buyer_open_chat", { p_store_id: buyerStore, p_order_token: buyerToken, p_body: buyerText.trim() });
      if (error) { setBuyerErr(error.message.includes("ORDER_TIDAK_DITEMUKAN") ? "Pesanan/token tidak cocok." : "Gagal membuka chat."); return; }
      setBuyerThread(String(data));
      setBuyerText("");
      await loadBuyerThread(String(data));
    } finally { setBuyerLoading(false); }
  };

  const sendBuyer = async () => {
    if (!buyerThread || !buyerText.trim()) return;
    setBuyerLoading(true);
    try {
      const { error } = await supabase.rpc("buyer_send_chat", { p_thread_id: buyerThread, p_order_token: buyerToken, p_body: buyerText.trim() });
      if (error) { setBuyerErr("Gagal kirim pesan."); return; }
      setBuyerText("");
      await loadBuyerThread(buyerThread);
    } finally { setBuyerLoading(false); }
  };

  const loadSellerThreads = async () => {
    if (!user) return;
    const { data } = await supabase.from("chat_threads").select("id,store_id,last_message_at").order("last_message_at", { ascending: false }).limit(50);
    setThreads((data ?? []) as any);
  };

  const loadSellerMsgs = async (tid: string) => {
    const { data } = await supabase.from("chat_messages").select("id,sender_type,body,created_at").eq("thread_id", tid).order("created_at");
    setSellerMsgs((data ?? []) as Msg[]);
  };

  useEffect(() => {
    if (user) loadSellerThreads();
  }, [user]);

  useEffect(() => {
    if (activeThread) loadSellerMsgs(activeThread);
  }, [activeThread]);

  const sendSeller = async () => {
    if (!activeThread || !sellerText.trim()) return;
    setSellerLoading(true);
    try {
      const { error } = await supabase.from("chat_messages").insert({ thread_id: activeThread, sender_type: "seller", body: sellerText.trim() });
      if (error) return;
      setSellerText("");
      await loadSellerMsgs(activeThread);
      await loadSellerThreads();
    } finally { setSellerLoading(false); }
  };

  // polling
  useEffect(() => {
    const t = setInterval(() => {
      if (buyerThread) loadBuyerThread(buyerThread);
      if (activeThread) { loadSellerMsgs(activeThread); loadSellerThreads(); }
    }, 5000);
    return () => clearInterval(t);
  }, [buyerThread, activeThread]);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-sm">
        <PageShell>
          <div className="flex h-[68px] items-center justify-between">
            <Link to="/" aria-label="TokoLink beranda"><Logo size={28} tone="light" wordClass="text-navy-800" /></Link>
            <ButtonLink to={user ? "/app" : "/"} size="sm" variant="secondary">Kembali</ButtonLink>
          </div>
        </PageShell>
      </header>

      <PageShell className="py-10">
        <div className="mx-auto max-w-[720px]">
          <h1 className="text-[26px] font-extrabold text-ink sm:text-[32px]">Chat</h1>
          <p className="mt-2 text-[14px] text-muted">Tanya jawab penjual & pembeli. Bot FAQ akan menyusul; saat ini chat langsung.</p>

          {!user && (
            <Card className="mt-6 p-5">
              <h2 className="text-[16px] font-extrabold text-ink">Buka chat sebagai pembeli</h2>
              <p className="mt-1 text-[13px] text-muted">Butuh ID toko dan token pesanan dari tautan cek status.</p>
              {!buyerThread ? (
                <div className="mt-4 space-y-3">
                  <Field label="ID toko"><Input value={buyerStore} onChange={(e) => setBuyerStore(e.target.value)} placeholder="uuid toko" /></Field>
                  <Field label="Token pesanan"><Input value={buyerToken} onChange={(e) => setBuyerToken(e.target.value)} placeholder="uuid token" /></Field>
                  <Field label="Pesan pertama"><Textarea value={buyerText} onChange={(e) => setBuyerText(e.target.value)} rows={3} /></Field>
                  {buyerErr && <p className="text-[13px] text-red-600">{buyerErr}</p>}
                  <Button onClick={openBuyerChat} loading={buyerLoading}>Mulai chat</Button>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="max-h-[360px] overflow-y-auto rounded-lg border border-line bg-canvas p-3 space-y-2">
                    {buyerMsgs.map((m) => (
                      <div key={m.id} className={m.sender_type === "buyer" ? "text-right" : "text-left"}>
                        <span className="inline-block rounded-lg bg-white px-3 py-2 text-[13.5px] text-ink shadow-sm">{m.body}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Input value={buyerText} onChange={(e) => setBuyerText(e.target.value)} placeholder="Tulis pesan..." onKeyDown={(e) => { if (e.key === "Enter") sendBuyer(); }} />
                    <Button onClick={sendBuyer} loading={buyerLoading}>Kirim</Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {user && (
            <div className="mt-6 grid gap-4 lg:grid-cols-[260px_1fr]">
              <Card className="p-3">
                <div className="micro mb-2 text-faint">Thread</div>
                <div className="space-y-1.5">
                  {threads.length === 0 && <p className="text-[13px] text-muted">Belum ada chat.</p>}
                  {threads.map((t) => (
                    <button key={t.id} onClick={() => setActiveThread(t.id)} className={cx("block w-full rounded-md border px-3 py-2 text-left text-[13px]", activeThread === t.id ? "border-brand-500 bg-brand-50" : "border-line bg-white hover:bg-canvas")}>
                      {t.id.slice(0, 8)}… · {new Date(t.last_message_at).toLocaleString("id-ID")}
                    </button>
                  ))}
                </div>
              </Card>
              <Card className="p-4">
                {activeThread ? (
                  <>
                    <div className="max-h-[400px] overflow-y-auto space-y-2">
                      {sellerMsgs.map((m) => (
                        <div key={m.id} className={m.sender_type === "seller" ? "text-right" : "text-left"}>
                          <span className="inline-block rounded-lg bg-canvas px-3 py-2 text-[13.5px] text-ink">{m.body}</span>
                          <div className="mt-0.5 text-[11px] text-faint">{m.sender_type}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Input value={sellerText} onChange={(e) => setSellerText(e.target.value)} placeholder="Balas..." onKeyDown={(e) => { if (e.key === "Enter") sendSeller(); }} />
                      <Button onClick={sendSeller} loading={sellerLoading}>Kirim</Button>
                    </div>
                  </>
                ) : (
                  <p className="text-[13px] text-muted">Pilih thread di kiri.</p>
                )}
              </Card>
            </div>
          )}
        </div>
      </PageShell>
    </div>
  );
}
