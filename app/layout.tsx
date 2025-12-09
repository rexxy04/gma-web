// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UIProvider } from "@/lib/context/UIContext";
import { AuthProvider } from "@/lib/context/AuthContext";
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
        {/* AuthProvider membungkus segalanya agar session user tersedia global */}
        <AuthProvider>
          <UIProvider>
            {children}
            <LoginModal />
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}