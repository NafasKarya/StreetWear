import { useState } from "react";
import RegisterPage from "../auth/RegisterPage";
import LoginPage from "../auth/LoginPage";

type Props = {
  onSessionChange: () => void; // Tetap dipakai di Home
};

export default function AppLoginRegisterProfile({ onSessionChange }: Props) {
  const [mode, setMode] = useState<"register" | "login">("login");

  if (mode === "register") {
    return (
      <RegisterPage
        onRegister={onSessionChange}
        onSwitchToLogin={() => setMode("login")}
      />
    );
  }
  return (
    <LoginPage
      onLogin={onSessionChange}
      onSwitchToRegister={() => setMode("register")}
    />
  );
}
