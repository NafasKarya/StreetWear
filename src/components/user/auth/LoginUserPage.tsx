"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserLoginStore } from "@/store/user/auth/useUserLoginStore";
import { useUserMeStore } from "@/store/user/auth/useUserMeStore";

const LoginUserPage: React.FC = () => {
  const [showPass, setShowPass] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const router = useRouter();

  // Ambil store + reset action
  const { isLoading, error, isSuccess, loginUser, resetLoginState } =
    useUserLoginStore();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Reset state login setiap halaman login mount
  useEffect(() => {
    resetLoginState();
  }, [resetLoginState]);

  // Redirect dashboard kalau login sukses
  useEffect(() => {
    if (isSuccess) {
      useUserMeStore
        .getState()
        .fetchUser()
        .then(() => {
          const user = useUserMeStore.getState().user;
          if (user && (user.is_activated === false || user.is_activated === 0)) {
            router.push("/user/auth/activated-code");
          } else {
            router.push("/user/dashboard");
          }
        });
    }
  }, [isSuccess, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    await loginUser({ email, password });
    // Jangan redirect di sini, biar state bener-bener update dulu baru redirect (via useEffect)
  };

  const handleRegisterClick = () => {
    setLoadingRegister(true);
    setTimeout(() => {
      router.push("/user/auth/register");
    }, 800);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* IMAGE BACKGROUND */}
      <Image
        src="/assets/images/splash.jpg" // ganti sesuai path di /public
        alt="Background"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-5xl font-extrabold text-white uppercase">
            USER LOGIN
          </h1>
          <p className="mt-2 text-lg text-white">Login Account User</p>

          {/* Error message */}
          {error && (
            <div className="my-4 bg-red-100 text-red-700 p-3 rounded text-sm text-left">
              {error}
            </div>
          )}
          {isSuccess && (
            <div className="my-4 bg-green-100 text-green-700 p-3 rounded text-sm text-left">
              Login berhasil! Redirecting...
            </div>
          )}

          <form
            className="mt-8 space-y-4"
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <div>
              <input
                ref={emailRef}
                id="credential"
                type="text"
                placeholder="Email"
                autoComplete="username"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded bg-white placeholder-black text-black border border-black focus:outline-none"
              />
            </div>
            <div className="relative">
              <input
                ref={passwordRef}
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded bg-white placeholder-black text-black border border-black focus:outline-none"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black"
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
                aria-label={
                  showPass ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPass ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-white underline"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-3 bg-black text-white font-semibold rounded
                transition-all duration-200 ease-in-out
                hover:bg-white hover:text-black
                active:scale-95
                focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
                disabled:opacity-50
              "
            >
              {isLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" /> LOGGING IN...
                </span>
              ) : (
                "LOG IN"
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-white">
            don't have account user?{" "}
            <button
              type="button"
              onClick={handleRegisterClick}
              disabled={loadingRegister || isLoading}
              className="underline font-semibold inline-flex items-center gap-2"
            >
              {loadingRegister ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Register user"
              )}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginUserPage;
