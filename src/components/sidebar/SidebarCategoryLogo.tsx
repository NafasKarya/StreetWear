'use client';
import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/logic/authLocal";
import { getAllCategories, addCategory, deleteCategory } from "@/logic/categoryLogic";

// Komponen Logo 3D (tetap, tanpa ubahan)
const SidebarLogo3D = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    import('@google/model-viewer');
  }, []);

  if (!isClient) return <div className="h-[130px]" />;
  return (
    <div className="flex flex-col items-center w-full pt-0 mt-0 mb-2">
      <div className="flex justify-center items-center">
<model-viewer
  src="/matrix/base.glb"
  camera-controls
  camera-orbit="-90deg 80deg 5m"
  auto-rotate
  rotation="0deg 90deg 0deg"
  style={{ width: "130px", height: "130px" }}
  exposure="1"
  interaction-prompt="none"
  background-color="#000000"
  disable-zoom
  disable-pan
></model-viewer>

      </div>
    </div>
  );
};

const SidebarNav = ({
  categories,
  isAdmin,
  onLinkClick,
  onDelete,
}: {
  categories: string[];
  isAdmin: boolean;
  onLinkClick?: () => void;
  onDelete?: (cat: string) => void;
}) => (
  <nav>
    <ul className="space-y-3">
      {categories.map((category) => (
        <li key={category} className="flex items-center group">
          <a
            href="#"
            onClick={onLinkClick}
            className="block text-xs uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors duration-200"
          >
            {category}
          </a>
          {isAdmin && (
            <button
              className="ml-2 text-xs text-red-500 opacity-60 hover:opacity-100"
              title="Hapus kategori"
              onClick={() => onDelete?.(category)}
            >
              &times;
            </button>
          )}
        </li>
      ))}
    </ul>
  </nav>
);

const SidebarCategoryLogo = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [err, setErr] = useState("");
  const [reload, setReload] = useState(0);

  const user = getCurrentUser();
  const isAdmin = user?.role === "admin";

  // Ambil kategori tiap reload
  useEffect(() => {
    setCategories(getAllCategories());
  }, [reload]);

  const handleAdd = () => {
    const res = addCategory(input);
    if (!res.ok) {
      setErr(res.msg);
    } else {
      setInput("");
      setErr("");
      setReload(r => r + 1);
    }
  };

  const handleDelete = (cat: string) => {
    deleteCategory(cat);
    setReload(r => r + 1);
  };

  return (
    <>
      <SidebarLogo3D />
      <div className="w-full">
        {/* ADMIN: Form tambah kategori (rapi, input & button bulat, satu baris) */}
        {isAdmin && (
          <form
            className="flex items-center gap-0.5 mb-4"
            onSubmit={e => {
              e.preventDefault();
              handleAdd();
            }}
            autoComplete="off"
          >
            <div className="relative flex-1">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                className="bg-neutral-900 border border-yellow-400 focus:border-yellow-300 text-yellow-400 rounded-l-full rounded-r-none px-4 py-2 text-xs w-full outline-none transition-all duration-150"
                placeholder="Tambah kategori…"
                onKeyDown={e => { if (e.key === "Escape") setInput(""); }}
                maxLength={24}
              />
            </div>
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-5 py-2 rounded-r-full rounded-l-none text-xs transition-all duration-150 border border-yellow-400 border-l-0 active:scale-95"
              tabIndex={-1}
            >
              Tambah
            </button>
          </form>
        )}
        {err && <div className="text-xs text-red-500 mb-2">{err}</div>}
        <SidebarNav
          categories={categories}
          isAdmin={isAdmin}
          onLinkClick={onLinkClick}
          onDelete={isAdmin ? handleDelete : undefined}
        />
      </div>
    </>
  );
};

export default SidebarCategoryLogo;
