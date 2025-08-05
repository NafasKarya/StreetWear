"use client";
import { useEffect, useState } from "react";
import SplashScreen from "@/components/SplashScreen";
import FourteenProduct from "@/components/productCatalog/ProductCatalog";
import { CartProvider } from "@/components/cart/CartContext";
import Checkout from "@/components/checkout/Checkout";
import Header from "@/components/header/Header";
import { getCurrentUser } from "@/logic/authLocal";
import AppLoginRegisterProfile from "@/components/profile/AppLoginRegisterProfile";
import AdminDashboard from "@/components/admin/AdminDashboard"; // IMPORT ADMIN DASHBOARD

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [user, setUser] = useState<any>(undefined); // undefined biar SSR safe

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // SplashScreen dulu
  if (showSplash) return <SplashScreen />;

  // Jangan render apapun sebelum user !== undefined (biar SSR/CSR sama)
  if (typeof window !== "undefined" && user === undefined) return null;

  // Belum login
  if (!user) {
    return (
      <AppLoginRegisterProfile
        onSessionChange={() => setUser(getCurrentUser())}
      />
    );
  }

  // --- DETEKSI ADMIN ---
  // role admin = email === "admin@fourteen.com" && password === "admin123"
  if (
    user?.email === "admin@fourteen.com" &&
    user?.password === "admin123"
  ) {
    return <AdminDashboard />;
  }

  // User biasa: render app normal
  return (
    <CartProvider>
      {/* <Header onCheckout={() => setShowCheckout(true)} /> */}
      {showCheckout ? (
        <Checkout onBack={() => setShowCheckout(false)} />
      ) : (
        <FourteenProduct />
      )}
    </CartProvider>
  );
}
