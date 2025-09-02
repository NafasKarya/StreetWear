'use client';

import * as React from 'react';

// === Contoh import ThemeProvider dari shadcn/ui ===
import { ThemeProvider } from 'next-themes';

// === Import provider lain jika ada, misal Redux, Auth, dsb ===
// import { SessionProvider } from "next-auth/react";
// import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    // Tambah atau nesting provider di sini
    // Contoh: ThemeProvider (dari shadcn/ui), bisa ditambahin lainnya
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
    // Kalau nggak pake theme, cukup: <>{children}</>
    // Kalau mau tambah provider lain, tinggal nesting aja
    // <SessionProvider>
    //   <ThemeProvider>
    //     <QueryClientProvider client={queryClient}>
    //       {children}
    //     </QueryClientProvider>
    //   </ThemeProvider>
    // </SessionProvider>
  );
}
