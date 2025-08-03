'use client';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LoginPage from "@/components/auth/LoginPage";
import RegisterPage from "@/components/auth/RegisterPage";
import { getCurrentUser } from "@/logic/authLocal";
import type { User } from "@/logic/authLocal";

const AuthScreen = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());

  // Ketika login berhasil, update user lalu redirect ke Home
  const handleLogin = () => {
    setCurrentUser(getCurrentUser());
    router.push("/"); // <-- Redirect ke halaman utama!
  };
  // Setelah register sukses, auto-login dan redirect ke Home
  const handleRegister = () => {
    setCurrentUser(getCurrentUser());
    router.push("/");
  };

  // **Tidak perlu render dashboard/profile di AuthScreen**
  return (
    <div>
      {mode === "login" ? (
        <LoginPage
          onLogin={handleLogin}
          onSwitchToRegister={() => setMode("register")}
        />
      ) : (
        <RegisterPage
          onRegister={handleRegister}
          onSwitchToLogin={() => setMode("login")}
        />
      )}
    </div>
  );
};

export default AuthScreen;
