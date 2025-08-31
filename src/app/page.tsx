"use client";
import { useEffect, useState } from "react";
import SplashScreen from "@/components/SplashScreen";
import FourteenProduct from "@/components/productCatalog/ProductCatalog";
import { CartProvider } from "@/components/cart/CartContext";
import Checkout from "@/components/checkout/Checkout";
import Header from "@/components/header/Header";
import { getCurrentUser } from "@/logic/authLocal";
import AppLoginRegisterProfile from "@/components/profile/AppLoginRegisterProfile";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [user, setUser] = useState<any>(undefined);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  // --- CEK & HAPUS SPLASH EXPIRED (5 MENIT) ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    const item = localStorage.getItem("hasSeenSplash");
    if (item) {
      try {
        const { expiresAt } = JSON.parse(item);
        if (Date.now() > expiresAt) {
          // Sudah expired, hapus
          localStorage.removeItem("hasSeenSplash");
          setShowSplash(true);
        } else {
          setShowSplash(false);
        }
      } catch {
        // Error parsing (misal value lama), clear aja
        localStorage.removeItem("hasSeenSplash");
        setShowSplash(true);
      }
    }
  }, []);

  // Set Splash expire 5 menit saat klik enter
  const handleSplashContinue = () => {
    if (typeof window !== "undefined") {
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 menit
      localStorage.setItem("hasSeenSplash", JSON.stringify({ expiresAt }));
    }
    setShowSplash(false);
  };

  if (showSplash) return <SplashScreen onContinue={handleSplashContinue} />;

  if (typeof window !== "undefined" && user === undefined) return null;

  if (!user) {
    return (
      <AppLoginRegisterProfile
        onSessionChange={() => setUser(getCurrentUser())}
      />
    );
  }

  if (
    user?.email === "admin@fourteen.com" &&
    user?.password === "admin123"
  ) {
    return <AdminDashboard />;
  }

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
