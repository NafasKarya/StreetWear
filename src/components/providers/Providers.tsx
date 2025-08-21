// src/components/providers/Providers.tsx
"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CartProvider } from "@/components/cart/CartContext";
import { getCurrentUser } from "@/logic/authLocal";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith("/admins") ?? false;

  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const u = await getCurrentUser(); // ⬅️ tunggu Promise<User | null>
        setIsAdminUser(
          !!u && u.email === "admin@fourteen.com" && (u as any).password === "admin123"
        );
      } catch {
        setIsAdminUser(false);
      }
    };
    checkAdmin();
  }, []);

  // Admin routes: JANGAN bungkus CartProvider sama sekali
  if (isAdminPath) return <>{children}</>;

  // Non-admin routes: SELALU bungkus CartProvider
  // - Saat status user belum ketahuan (null) → disabled=true (biar aman saat prerender)
  // - Kalau user admin (isAdminUser === true) → tetap kasih children langsung TANPA CartProvider
  if (isAdminUser === true) {
    return <>{children}</>;
  }

  // isAdminUser === null (loading) atau false (user biasa) → bungkus CartProvider
  return (
    <CartProvider
      key="cart:user:v1"
      storageKey="cart:user:v1"
      sessionScope="user"
      disabled={isAdminUser === null}   // ⬅️ penting: saat prerender/loading, context tetap ada
      metricsEndpoint="/api/user/metrics/event"
    >
      {children}
    </CartProvider>
  );
}
