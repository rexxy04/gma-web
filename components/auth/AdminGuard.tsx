"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Tunggu sampai loading selesai
    if (!isLoading) {
      // 1. Jika tidak ada user sama sekali
      if (!user) {
        router.replace("/"); // Tendang ke Home
      } 
      // 2. Jika user ada, TAPI role-nya bukan admin (misal Warga iseng coba masuk)
      else if (user.role !== "admin") {
        alert("Anda tidak memiliki akses ke halaman ini.");
        router.replace("/");
      }
    }
  }, [user, isLoading, router]);

  // TAMPILAN SAAT LOADING (Mencegah flash content)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Memverifikasi akses...</p>
      </div>
    );
  }

  // Jika user null (tapi useEffect belum jalan), jangan render apapun biar aman
  if (!user || user.role !== "admin") {
    return null; 
  }

  // Jika lolos semua cek, tampilkan halaman Admin
  return <>{children}</>;
}