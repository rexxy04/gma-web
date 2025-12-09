"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  TrendingDown, 
  CheckCircle, 
  Newspaper, 
  Calendar, 
  Image as ImageIcon, 
  MessageSquare,
  X,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import Button from "@/components/ui/Button";

// Definisi Struktur Menu
const MENU_ITEMS = [
  {
    group: "Utama",
    items: [
      { name: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    group: "Manajemen Warga",
    items: [
      { name: "Data Warga", href: "/dashboard/warga", icon: Users },
    ]
  },
  {
    group: "Keuangan",
    items: [
      { name: "Verifikasi Iuran", href: "/dashboard/keuangan/verifikasi", icon: CheckCircle },
      { name: "Riwayat Pemasukan", href: "/dashboard/keuangan/pemasukan", icon: Wallet },
      { name: "Catat Pengeluaran", href: "/dashboard/keuangan/pengeluaran", icon: TrendingDown },
    ]
  },
  {
    group: "Konten Website",
    items: [
      { name: "Kelola Aktivitas", href: "/dashboard/cms/aktivitas", icon: Newspaper },
      { name: "Kelola Jadwal", href: "/dashboard/cms/jadwal", icon: Calendar },
      { name: "Kelola Galeri", href: "/dashboard/cms/galeri", icon: ImageIcon },
    ]
  },
  {
    group: "Layanan",
    items: [
      { name: "Aduan Masuk", href: "/dashboard/aduan", icon: MessageSquare },
    ]
  }
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname(); // Untuk cek URL aktif
  const { logout } = useAuth();

  return (
    <>
      {/* MOBILE OVERLAY (Hanya muncul di mobile saat menu buka) */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* SIDEBAR CONTAINER */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* HEADER SIDEBAR */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <span className="font-bold text-lg tracking-wide">Admin Panel</span>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE MENU AREA */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          
          {MENU_ITEMS.map((group) => (
            <div key={group.group}>
              <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose} // Tutup sidebar pas klik (di mobile)
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-blue-600 text-white" 
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <item.icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* LOGOUT BUTTON (Di Bawah) */}
          <div className="pt-4 border-t border-slate-800 mt-auto">
             <button 
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
             >
                <LogOut size={18} />
                Keluar
             </button>
          </div>
        </div>
      </aside>
    </>
  );
}