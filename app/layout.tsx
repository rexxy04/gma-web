// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 1. Import Provider dan Modal
import { UIProvider } from "@/lib/context/UIContext";
import LoginModal from "@/components/auth/LoginModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Griya Mulya Asri",
  description: "Portal Resmi Perumahan Griya Mulya Asri",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={inter.className}>
        {/* 2. BUNGKUS SELURUH APLIKASI DI SINI */}
        <UIProvider>
          {/* Konten halaman (termasuk Navbar di dalam public layout) akan dirender di sini */}
          {children}
          
          {/* Login Modal ditaruh di sini agar bisa muncul di atas semua halaman */}
          <LoginModal />
        </UIProvider>
      </body>
    </html>
  );
}