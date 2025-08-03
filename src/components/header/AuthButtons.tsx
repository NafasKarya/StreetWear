import React from "react";
import { useRouter } from "next/navigation";

type Props = {
    isMobile?: boolean; // Biar styling bisa beda dikit kalau mobile
};

const AuthButtons: React.FC<Props> = ({ isMobile }) => {
    const router = useRouter();
    return (
        <div className={isMobile ? "" : "ml-5 flex items-center gap-2"}>
            <button
                className={
                    isMobile
                        ? "px-2 py-0.5 rounded-full border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-semibold text-xs transition"
                        : "px-4 py-1 rounded-full border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-semibold transition"
                }
                onClick={() => router.push("/auth")}
            >
                Login
            </button>
            <button
                className={
                    isMobile
                        ? "px-2 py-0.5 rounded-full border border-yellow-400 text-yellow-400 hover:bg-white hover:text-black font-semibold text-xs transition"
                        : "px-4 py-1 rounded-full border border-yellow-400 text-yellow-400 hover:bg-white hover:text-black font-semibold transition"
                }
                onClick={() => router.push("/register")}
            >
                Daftar
            </button>
        </div>
    );
};

export default AuthButtons;
