'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginPage from "@/components/auth/LoginPage";
import RegisterPage from "@/components/auth/RegisterPage";
import { getCurrentUser, type User } from "@/logic/authLocal";

const AuthScreen = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser(); // ⬅️ ini async
      setCurrentUser(u);
      if (u) router.replace("/");      // kalau udah login, tendang ke Home
    })();
  }, [router]);

  const handleLogin = async () => {
    const u = await getCurrentUser();  // ⬅️ tunggu
    setCurrentUser(u);
    router.replace("/");               // balik ke Home
  };

  const handleRegister = async () => {
    const u = await getCurrentUser();
    setCurrentUser(u);
    router.replace("/");
  };

  return mode === "login" ? (
    <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setMode("register")} />
  ) : (
    <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setMode("login")} />
  );
};

export default AuthScreen;
