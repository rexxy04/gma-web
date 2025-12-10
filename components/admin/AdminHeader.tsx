"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link"; // Tambah Link
import { usePathname } from "next/navigation";
import { Menu, Bell, CheckCircle, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { getPendingPayments } from "@/lib/services/payment-service";
import { getAllComplaints } from "@/lib/services/complaint-service";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // State Notifikasi
  const [counts, setCounts] = useState({ payments: 0, complaints: 0 });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Data Notifikasi (Real)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Ambil data parallel
        const [payments, complaints] = await Promise.all([
          getPendingPayments(), // Ambil pembayaran pending
          getAllComplaints("pending") // Ambil aduan pending
        ]);
        
        setCounts({
          payments: payments.length,
          complaints: complaints.length
        });
      } catch (error) {
        console.error("Gagal load notifikasi header:", error);
      }
    };

    fetchNotifications();

    // Opsional: Pasang interval polling setiap 30 detik agar realtime tanpa refresh
    // const interval = setInterval(fetchNotifications, 30000);
    // return () => clearInterval(interval);
  }, [pathname]); // Refresh setiap pindah halaman agar angka update

  // Logic Klik Luar untuk tutup dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalNotif = counts.payments + counts.complaints;

  // Breadcrumb Logic
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
        
        {/* NOTIFIKASI DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            >
                <Bell size={20} />
                {/* Dot Merah (Hanya jika ada notifikasi) */}
                {totalNotif > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                )}
            </button>

            {/* DROPDOWN CONTENT */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-4 py-2 border-b border-slate-50">
                        <h4 className="font-semibold text-sm text-slate-800">Notifikasi</h4>
                    </div>
                    
                    {totalNotif === 0 ? (
                        <div className="px-4 py-6 text-center text-slate-400 text-sm">
                            Tidak ada notifikasi baru.
                        </div>
                    ) : (
                        <div>
                            {/* Notif Pembayaran */}
                            {counts.payments > 0 && (
                                <Link 
                                    href="/dashboard/keuangan/verifikasi"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-full shrink-0">
                                        <CheckCircle size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">Verifikasi Iuran</p>
                                        <p className="text-xs text-slate-500">{counts.payments} pembayaran menunggu konfirmasi.</p>
                                    </div>
                                </Link>
                            )}

                            {/* Notif Aduan */}
                            {counts.complaints > 0 && (
                                <Link 
                                    href="/dashboard/aduan"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full shrink-0">
                                        <MessageSquare size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">Laporan Warga</p>
                                        <p className="text-xs text-slate-500">{counts.complaints} aduan baru masuk.</p>
                                    </div>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* PROFILE INFO */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800 leading-none">
                    {user?.displayName || "Pengurus"}
                </p>
                <p className="text-xs text-slate-500 mt-1 capitalize">
                    {user?.role || "Admin"}
                </p>
            </div>
            
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "A"}
            </div>
        </div>
      </div>
    </header>
  );
}