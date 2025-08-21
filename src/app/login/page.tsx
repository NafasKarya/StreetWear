// app/login/page.tsx
export const dynamic = "force-dynamic"; // biar gak di-SSG

import { Suspense } from "react";
import AuthScreen from "@/components/auth/AuthScreen";

export default function LoginRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400">Memuat…</div>}>
      <AuthScreen />
    </Suspense>
  );
}
