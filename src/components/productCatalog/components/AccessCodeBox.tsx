// src/components/product/AccessCodeBox.tsx
"use client";

import React, { useState, useCallback } from "react";

export type AccessCodeBoxProps = {
  onVerified?: () => void | Promise<void>;
};

export default function AccessCodeBox({ onVerified }: AccessCodeBoxProps) {
  const [accessInput, setAccessInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [verifyOk, setVerifyOk] = useState<boolean | null>(null);

  const submit = useCallback(async () => {
    setVerifyMsg(null);
    setVerifyOk(null);
    const code = accessInput.trim();
    if (!code) {
      setVerifyMsg("Kode tidak boleh kosong");
      setVerifyOk(false);
      return;
    }
    try {
      setVerifying(true);
      // kalau API kamu yang bener /api/access/claim, ganti URL di bawah.
      const res = await fetch("/api/access-codes/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ code }),
      });

      const ct = res.headers.get("content-type") || "";
      const raw = await res.text();
      const data = ct.includes("application/json") && raw ? JSON.parse(raw) : null;

      if (!res.ok || !data?.ok) {
        const msg = data?.message || (raw ? raw.slice(0, 200) : "Verifikasi gagal");
        setVerifyOk(false);
        setVerifyMsg(msg || "Kode akses salah");
        return;
      }

      setVerifyOk(true);
      const s = data?.data?.scope ? ` (scope: ${data.data.scope})` : "";
      setVerifyMsg(`Kode valid${s}.`);

      // 🔔 panggil callback biar parent bisa refetch includeHidden
      await onVerified?.();
    } catch (e: any) {
      console.error(e);
      setVerifyOk(false);
      setVerifyMsg(e?.message || "Verifikasi gagal");
    } finally {
      setVerifying(false);
    }
  }, [accessInput, onVerified]);

  return (
    <div className="mb-8 p-4 rounded-lg border border-yellow-400/40 bg-white/5">
      <h4 className="text-lg font-bold text-yellow-400 mb-3">Masukkan Kode Akses</h4>
      <div className="flex gap-2">
        <input
          value={accessInput}
          onChange={(e) => setAccessInput(e.target.value)}
          placeholder="contoh: acs_xxx..."
          className="flex-1 px-3 py-2 rounded bg-black text-white border border-yellow-400/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
          disabled={verifying}
        />
        <button
          onClick={submit}
          disabled={verifying || !accessInput.trim()}
          className="px-4 py-2 rounded bg-yellow-400 text-black font-bold hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-60"
        >
          {verifying ? "Memeriksa..." : "Verifikasi"}
        </button>
      </div>
      {verifyMsg && (
        <p className={`mt-2 text-sm ${verifyOk ? "text-emerald-400" : "text-red-400"}`}>
          {verifyMsg}
        </p>
      )}
    </div>
  );
}
