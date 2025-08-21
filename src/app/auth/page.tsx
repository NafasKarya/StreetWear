// src/app/auth/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import LoginPage from "@/components/auth/LoginPage";
import RegisterPage from "@/components/auth/RegisterPage";
import { getCurrentUser, getCurrentUserLocal, type User } from "@/logic/authLocal";

const AuthScreen = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUserLocal());

  useEffect(() => {
    let alive = true;
    (async () => {
      const u = await getCurrentUser();
      if (alive) setCurrentUser(u);
    })();
    return () => { alive = false; };
  }, []);

  const handleLogin = async () => {
    const u = await getCurrentUser();
    setCurrentUser(u);
    router.push("/");
  };

  const handleRegister = async () => {
    const u = await getCurrentUser();
    setCurrentUser(u);
    router.push("/");
  };

  return (
    <Suspense fallback={<div className="p-8 text-neutral-400">Memuat…</div>}>
      {mode === "login" ? (
        <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setMode("register")} />
      ) : (
        <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setMode("login")} />
      )}
    </Suspense>
  );
};

export default AuthScreen;
