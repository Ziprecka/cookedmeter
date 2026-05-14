"use client";

import { useState } from "react";

type UsageSession = {
  anon_session_id: string;
  total_generations: number;
  free_generations_used: number;
  paid_credits_remaining: number;
  has_unlimited: boolean;
  no_watermark: boolean;
  updated_at: string;
};

type Purchase = {
  stripe_session_id: string;
  anon_session_id: string | null;
  product_type: string;
  credits_added: number;
  amount_paid: number | null;
  status: string;
  created_at: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [sessions, setSessions] = useState<UsageSession[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadAdmin() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/summary", {
        method: "POST",
        headers: { "x-admin-password": password },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Admin failed.");
      setSessions(data.sessions ?? []);
      setPurchases(data.purchases ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Admin failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050404] px-4 py-8 text-[#fff9ed]">
      <section className="mx-auto max-w-5xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-200/60">
          CookedMeter admin
        </p>
        <h1 className="mt-3 text-4xl font-black">Oven room.</h1>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Admin password"
            className="min-h-12 flex-1 rounded-full border border-white/10 bg-black/48 px-5 text-white outline-none focus:border-orange-300/50"
          />
          <button
            type="button"
            onClick={loadAdmin}
            disabled={loading}
            className="min-h-12 rounded-full bg-orange-500 px-6 font-black text-white disabled:opacity-60"
          >
            {loading ? "Loading..." : "Open admin"}
          </button>
        </div>

        {error ? <p className="mt-4 font-bold text-red-300">{error}</p> : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <AdminPanel title="Recent sessions">
            {sessions.map((session) => (
              <div key={session.anon_session_id} className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
                <p className="truncate text-xs font-bold text-white/38">
                  {session.anon_session_id}
                </p>
                <p className="mt-2 text-2xl font-black">
                  {session.total_generations} checks
                </p>
                <p className="mt-1 text-sm text-white/58">
                  free {session.free_generations_used}/5 · paid {session.paid_credits_remaining} · {session.has_unlimited ? "unlimited" : "metered"} · {session.no_watermark ? "no watermark" : "watermark"}
                </p>
              </div>
            ))}
          </AdminPanel>

          <AdminPanel title="Recent purchases">
            {purchases.map((purchase) => (
              <div key={purchase.stripe_session_id} className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-200/58">
                  {purchase.product_type}
                </p>
                <p className="mt-2 text-xl font-black">
                  {purchase.amount_paid === null
                    ? "Unknown amount"
                    : `$${(purchase.amount_paid / 100).toFixed(2)}`}
                </p>
                <p className="mt-1 truncate text-xs text-white/40">
                  {purchase.stripe_session_id}
                </p>
              </div>
            ))}
          </AdminPanel>
        </div>
      </section>
    </main>
  );
}

function AdminPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-black/30 p-4">
      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/44">
        {title}
      </h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}
