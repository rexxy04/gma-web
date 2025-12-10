"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth(); // Data user asli dari Firestore

  // Logic simpel untuk membuat Breadcrumb dari URL
  // Contoh: /dashboard/keuangan/verifikasi -> ["Dashboard", "Keuangan", "Verifikasi"]
  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6 shadow-sm">
      
      {/* TOGGLE SIDEBAR (Mobile Only) */}
      <button 
        onClick={onMenuClick}
        className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
      >
        <Menu size={20} />
      </button>

      {/* BREADCRUMB */}
      <div className="flex-1 hidden sm:flex items-center gap-2 text-sm text-slate-500">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb} className="flex items-center">
            {index > 0 && <span className="mx-2 text-slate-300">/</span>}
            <span className={index === breadcrumbs.length - 1 ? "font-semibold text-slate-800" : ""}>
              {crumb}
            </span>
          </span>
        ))}
      </div>

      {/* RIGHT AREA */}
      <div className="flex items-center gap-4">
        {/* Notifikasi (Placeholder Fitur) */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Bell size={20} />
            {/* Dot merah indikator */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* PROFILE INFO */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden md:block">
                {/* Tampilkan Nama Asli */}
                <p className="text-sm font-bold text-slate-800 leading-none">
                    {user?.displayName || "Pengurus"}
                </p>
                {/* Tampilkan Role Asli */}
                <p className="text-xs text-slate-500 mt-1 capitalize">
                    {user?.role || "Admin"}
                </p>
            </div>
            
            {/* Avatar Circle */}
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "A"}
            </div>
        </div>
      </div>
    </header>
  );
}