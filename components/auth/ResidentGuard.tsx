"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ResidentGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Jika belum login, lempar ke Home (nanti bisa buka modal login)
      if (!user) {
        router.replace("/");
      } 
      // Jika login tapi ADMIN, lempar ke Dashboard Admin (bukan tempatnya warga)
      else if (user.role === "admin") {
        router.replace("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Memuat data warga...</p>
      </div>
    );
  }

  if (!user || user.role !== "resident") return null;

  return <>{children}</>;
}