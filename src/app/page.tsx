"use client";
import { useEffect, useState } from "react";
import SplashScreen from "@/components/SplashScreen";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

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

  // Selalu render SplashScreen (atau null kalau udah lanjut)
  if (showSplash) return <SplashScreen onContinue={handleSplashContinue} />;
  return null;
}
