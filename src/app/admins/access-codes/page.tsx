// src/app/admins/access-codes/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: number;
  label: string | null;
  scope: string;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  enabled: boolean;
  createdAt: string;
  deletedAt: string | null;
};

type CreateMode = "auto" | "manual";

const Page: React.FC = () => {
  const router = useRouter();

  // ===== admin guard =====
  const [adminChecked, setAdminChecked] = useState(false);

  // ===== list state =====
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // ===== edit modal =====
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);

  // ===== rotate result modal =====
  const [rotatedToken, setRotatedToken] = useState("");

  // ===== create form =====
  const [creating, setCreating] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>("auto");
  const [cLabel, setCLabel] = useState<string>("");
  const [cScope, setCScope] = useState<string>("product:special:view");
  const [cMaxUses, setCMaxUses] = useState<string>(""); // empty = unlimited
  const [cExpiresAt, setCExpiresAt] = useState<string>(""); // datetime-local
  const [cEnabled, setCEnabled] = useState<boolean>(true);
  // auto options
  const [cPrefix, setCPrefix] = useState<string>("acs_");
  const [cLength, setCLength] = useState<number>(32);
  // manual token
  const [cToken, setCToken] = useState<string>("");

  // ===== create result modal (plaintext) =====
  const [createdToken, setCreatedToken] = useState("");

  // disable tombol per-row saat aksi
  const [actingId, setActingId] = useState<number | null>(null);

  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  // ---- ADMIN GUARD ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetch("/api/auth/admin/me", {
          credentials: "include",
          cache: "no-store",
        });
        const isOk = me.ok ? await me.json() : null;
        if (!isOk || isOk.role !== "admin") {
          router.replace("/login?next=/admins/access-codes");
          return;
        }
        if (!cancelled) {
          setAdminChecked(true);
          fetchList(1, "");
        }
      } catch {
        router.replace("/login?next=/admins/access-codes");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchList(p = page, query = q) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/access-codes?page=${p}&pageSize=${pageSize}&q=${encodeURIComponent(
          query
        )}`,
        { credentials: "include", cache: "no-store" }
      );
      const ct = res.headers.get("content-type") || "";
      const raw = await res.text();
      const data = ct.includes("application/json") && raw ? JSON.parse(raw) : null;

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || (raw ? raw.slice(0, 200) : "Gagal mengambil list"));
      }
setItems((data.items ?? []).filter((it: Item) => !it.deletedAt));
setTotal(data.total ?? 0); // kalau total dari server belum exclude, nanti kita benerin di server
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Gagal mengambil list");
    } finally {
      setLoading(false);
    }
  }

  // ====== CREATE ======
  const create = async () => {
    try {
      // validasi ringan
      if (createMode === "manual" && (!cToken || cToken.trim().length < 16)) {
        alert("Token manual minimal 16 karakter.");
        return;
      }
      setCreating(true);

      const body: any = {
        label: cLabel.trim() ? cLabel.trim() : undefined,
        scope: cScope.trim() || "product:special:view",
        enabled: cEnabled,
      };

      // maxUses
      if (cMaxUses !== "") {
        const n = Number(cMaxUses);
        if (Number.isFinite(n) && n >= 0) body.maxUses = n;
      }
      // expiresAt (datetime-local -> ISO)
      if (cExpiresAt) {
        const d = new Date(cExpiresAt);
        if (!isNaN(d.getTime())) {
          body.expiresAt = d.toISOString();
        }
      }

      if (createMode === "manual") {
        body.token = cToken.trim();
      } else {
        if (cPrefix) body.prefix = cPrefix;
        if (cLength) body.length = cLength;
      }

      const res = await fetch("/api/admin/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const ct = res.headers.get("content-type") || "";
      const raw = await res.text();
      const data = ct.includes("application/json") && raw ? JSON.parse(raw) : null;

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || (raw ? raw.slice(0, 200) : "Gagal membuat kode"));
      }

      const t = data?.access_token_plaintext as string | undefined;
      if (t) setCreatedToken(t);
      // reset form ringan (opsional)
      setCLabel("");
      setCMaxUses("");
      setCExpiresAt("");
      setCEnabled(true);
      if (createMode === "manual") setCToken("");

      await fetchList(1, q);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Gagal membuat kode");
    } finally {
      setCreating(false);
    }
  };

  // ====== EDIT ======
  const openEdit = (it: Item) => {
    setEditItem(it);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editItem) return;
    setActingId(editItem.id);
    try {
      const body = {
        label: editItem.label ?? undefined,
        scope: editItem.scope ?? undefined,
        maxUses: editItem.maxUses,     // null = unlimited
        expiresAt: editItem.expiresAt, // ISO atau null
        enabled: editItem.enabled,
      };
      const res = await fetch(`/api/admin/access-codes/${editItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const ct = res.headers.get("content-type") || "";
      const raw = await res.text();
      const data = ct.includes("application/json") && raw ? JSON.parse(raw) : null;

      if (!res.ok) throw new Error(data?.message || (raw ? raw.slice(0, 200) : "Gagal update"));
      setEditOpen(false);
      await fetchList(page, q);
    } catch (e: any) {
      alert(e?.message || "Gagal update");
    } finally {
      setActingId(null);
    }
  };

  // ====== ROTATE ======
  const rotate = async (id: number) => {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/access-codes/${id}/rotate`, {
        method: "POST",
        credentials: "include",
      });
      const ct = res.headers.get("content-type") || "";
      const raw = await res.text();
      const data = ct.includes("application/json") && raw ? JSON.parse(raw) : null;

      if (!res.ok) throw new Error(data?.message || (raw ? raw.slice(0, 200) : "Gagal rotate"));

      const t = data?.access_token_plaintext;
      if (t) setRotatedToken(t);
      await fetchList(page, q);
    } catch (e: any) {
      alert(e?.message || "Gagal rotate");
    } finally {
      setActingId(null);
    }
  };

  // ====== DELETE ======
const remove = async (id: number) => {
  if (!confirm("Yakin hapus kode ini?")) return;
  setActingId(id);
  try {
    // optimistic update dulu
    setItems((prev) => prev.filter((it) => it.id !== id));
    setTotal((t) => Math.max(0, t - 1));

    const res = await fetch(`/api/admin/access-codes/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const ok = res.ok;
    if (!ok) throw new Error("Gagal hapus");

    // tetap refresh buat sinkron data & pagination
    await fetchList(page, q);
  } catch (e: any) {
    alert(e?.message || "Gagal hapus");
    // optional: rollback kalau mau
    await fetchList(page, q);
  } finally {
    setActingId(null);
  }
};


  if (!adminChecked) {
    return (
      <div className="min-h-screen bg-black text-gray-200 p-6 font-mono">
        <div className="opacity-70">Memeriksa sesi admin…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 p-6 font-mono">
      <h1 className="text-2xl font-bold text-yellow-400 mb-4">Access Codes</h1>

      {/* ====== FORM CREATE ====== */}
      <div className="mb-6 p-4 rounded border border-yellow-400/30 bg-white/5">
        <h2 className="font-bold text-yellow-400 mb-3">Buat Kode Akses</h2>

        <div className="flex flex-wrap items-center gap-4 mb-3">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={createMode === "auto"}
              onChange={() => setCreateMode("auto")}
            />
            <span>Generate Otomatis</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={createMode === "manual"}
              onChange={() => setCreateMode("manual")}
            />
            <span>Masukkan Manual</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label>
            <div className="text-xs text-gray-400 mb-1">Label (opsional)</div>
            <input
              className="w-full px-3 py-2 rounded bg-black border border-yellow-400/30"
              value={cLabel}
              onChange={(e) => setCLabel(e.target.value)}
              placeholder="contoh: promosi IG"
            />
          </label>

          <label className="md:col-span-2">
            <div className="text-xs text-gray-400 mb-1">Scope</div>
            <input
              className="w-full px-3 py-2 rounded bg-black border border-yellow-400/30"
              value={cScope}
              onChange={(e) => setCScope(e.target.value)}
              placeholder="product:special:view"
            />
          </label>

          <label>
            <div className="text-xs text-gray-400 mb-1">Max Uses (kosong = ∞)</div>
            <input
              className="w-full px-3 py-2 rounded bg-black border border-yellow-400/30"
              type="number"
              value={cMaxUses}
              onChange={(e) => setCMaxUses(e.target.value)}
              placeholder="misal: 1"
            />
          </label>

          <label>
            <div className="text-xs text-gray-400 mb-1">Expires At</div>
            <input
              className="w-full px-3 py-2 rounded bg-black border border-yellow-400/30"
              type="datetime-local"
              value={cExpiresAt}
              onChange={(e) => setCExpiresAt(e.target.value)}
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={cEnabled}
              onChange={(e) => setCEnabled(e.target.checked)}
            />
            <span>Enabled</span>
          </label>
        </div>

        {createMode === "auto" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <label>
              <div className="text-xs text-gray-400 mb-1">Prefix</div>
              <input
                className="w-full px-3 py-2 rounded bg-black border border-yellow-400/30"
                value={cPrefix}
                onChange={(e) => setCPrefix(e.target.value)}
                placeholder="acs_"
              />
            </label>
            <label>
              <div className="text-xs text-gray-400 mb-1">Length</div>
              <input
                className="w-full px-3 py-2 rounded bg-black border border-yellow-400/30"
                type="number"
                value={cLength}
                onChange={(e) => setCLength(Number(e.target.value))}
                min={8}
                max={128}
              />
            </label>
          </div>
        ) : (
          <div className="mt-3">
            <div className="text-xs text-gray-400 mb-1">Token Manual (min 16)</div>
            <input
              className="w-full px-3 py-2 rounded bg-black border border-yellow-400/30 font-mono"
              value={cToken}
              onChange={(e) => setCToken(e.target.value)}
              placeholder="acs_xxx..."
            />
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={create}
            disabled={creating}
            className="px-4 py-2 rounded bg-yellow-400 text-black font-bold hover:bg-yellow-300 disabled:opacity-60"
          >
            {creating ? "Membuat..." : "Buat Kode"}
          </button>
        </div>
      </div>

      {/* ====== SEARCH ====== */}
      <div className="flex items-center gap-2 mb-4">
        <input
          className="px-3 py-2 rounded bg-black border border-yellow-400/40 focus:ring-2 focus:ring-yellow-400/60"
          placeholder="Cari label/scope…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded bg-yellow-400 text-black font-bold hover:bg-yellow-300"
          onClick={() => { setPage(1); fetchList(1, q); }}
        >
          Cari
        </button>
      </div>

      {/* ====== TABLE ====== */}
      <div className="overflow-x-auto rounded border border-yellow-400/30">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Label</th>
              <th className="p-2 text-left">Scope</th>
              <th className="p-2 text-left">Max</th>
              <th className="p-2 text-left">Used</th>
              <th className="p-2 text-left">Expires</th>
              <th className="p-2 text-left">Enabled</th>
              <th className="p-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan={8}>Memuat…</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-3" colSpan={8}>Kosong.</td></tr>
            ) : items.map((it) => {
              const acting = actingId === it.id;
              return (
                <tr key={it.id} className="border-t border-yellow-400/20">
                  <td className="p-2">{it.id}</td>
                  <td className="p-2">{it.label ?? <span className="text-gray-500">—</span>}</td>
                  <td className="p-2">{it.scope}</td>
                  <td className="p-2">{it.maxUses ?? <span className="text-gray-500">∞</span>}</td>
                  <td className="p-2">{it.usedCount}</td>
                  <td className="p-2">
                    {it.expiresAt
                      ? new Date(it.expiresAt).toLocaleString()
                      : <span className="text-gray-500">—</span>}
                  </td>
                  <td className="p-2">{it.enabled ? "Yes" : "No"}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      className="px-2 py-1 bg-emerald-500 text-black rounded disabled:opacity-50"
                      onClick={() => openEdit(it)}
                      disabled={acting}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 bg-indigo-400 text-black rounded disabled:opacity-50"
                      onClick={() => rotate(it.id)}
                      disabled={acting}
                      title="Ganti token (plaintext baru ditampilkan sekali)"
                    >
                      Rotate
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-black rounded disabled:opacity-50"
                      onClick={() => remove(it.id)}
                      disabled={acting}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* pagination simple */}
      <div className="flex gap-2 mt-4">
        <button
          className="px-3 py-1 rounded bg-white/10 disabled:opacity-50"
          onClick={() => { const p = Math.max(1, page - 1); setPage(p); fetchList(p, q); }}
          disabled={page <= 1}
        >
          Prev
        </button>
        <div className="px-3 py-1">Page {page} / {pages}</div>
        <button
          className="px-3 py-1 rounded bg-white/10 disabled:opacity-50"
          onClick={() => { const p = Math.min(pages, page + 1); setPage(p); fetchList(p, q); }}
          disabled={page >= pages}
        >
          Next
        </button>
      </div>

      {/* Modal Edit */}
      {editOpen && editItem && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white text-black w-full max-w-lg rounded-xl p-5">
            <h3 className="font-bold mb-3">Edit Access Code #{editItem.id}</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2">
                <div className="text-xs text-gray-600 mb-1">Label</div>
                <input
                  className="w-full border p-2 rounded"
                  value={editItem.label ?? ""}
                  onChange={(e) => setEditItem({ ...editItem, label: e.target.value || null })}
                />
              </label>
              <label className="col-span-2">
                <div className="text-xs text-gray-600 mb-1">Scope</div>
                <input
                  className="w-full border p-2 rounded"
                  value={editItem.scope}
                  onChange={(e) => setEditItem({ ...editItem, scope: e.target.value })}
                />
              </label>
              <label>
                <div className="text-xs text-gray-600 mb-1">Max Uses (kosong = ∞)</div>
                <input
                  className="w-full border p-2 rounded"
                  type="number"
                  value={editItem.maxUses ?? ""}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      maxUses: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                <div className="text-xs text-gray-600 mb-1">Expires At (ISO / kosong)</div>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="2025-12-31T23:59:59.000Z"
                  value={editItem.expiresAt ?? ""}
                  onChange={(e) => setEditItem({ ...editItem, expiresAt: e.target.value || null })}
                />
              </label>
              <label className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editItem.enabled}
                  onChange={(e) => setEditItem({ ...editItem, enabled: e.target.checked })}
                />
                <span>Enabled</span>
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setEditOpen(false)}>
                Batal
              </button>
              <button
                className="px-4 py-2 bg-yellow-400 rounded font-bold disabled:opacity-50"
                onClick={saveEdit}
                disabled={actingId === editItem.id}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rotate Result */}
      {rotatedToken && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white text-black w-full max-w-lg rounded-xl p-5">
            <h3 className="font-bold mb-2">Token Baru</h3>
            <p className="text-sm text-gray-600 mb-3">
              Simpan sekarang ya. Setelah ini server hanya simpan HASH-nya.
            </p>
            <div className="bg-gray-100 p-3 rounded font-mono text-sm break-all select-all">
              {rotatedToken}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-yellow-400 rounded font-bold"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(rotatedToken);
                    alert("Tersalin");
                  } catch {}
                }}
              >
                Copy
              </button>
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setRotatedToken("")}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create Result */}
      {createdToken && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white text-black w-full max-w-lg rounded-xl p-5">
            <h3 className="font-bold mb-2">Kode Akses Dibuat</h3>
            <p className="text-sm text-gray-600 mb-3">
              Simpan sekarang ya. Setelah ini server hanya menyimpan HASH-nya.
            </p>
            <div className="bg-gray-100 p-3 rounded font-mono text-sm break-all select-all">
              {createdToken}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-yellow-400 rounded font-bold"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(createdToken);
                    alert("Tersalin");
                  } catch {}
                }}
              >
                Copy
              </button>
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setCreatedToken("")}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
