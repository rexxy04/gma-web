"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation"; // 1. Tambah usePathname
import { Menu, X, Home, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react"; 
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { useUI } from "@/lib/context/UIContext";
import { useAuth } from "@/lib/context/AuthContext";

const navItems = [
  { name: "Aktivitas Warga", href: "/aktivitas" },
  { name: "Menu Cepat", href: "/#menu-cepat" },
  { name: "Jadwal Kegiatan", href: "/#jadwal" },
  { name: "Dokumentasi", href: "/#dokumentasi" },
  { name: "Kepengurusan", href: "/#kepengurusan" },
];

export default function Navbar() {
  const { openLoginModal } = useUI();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // 2. Ambil path URL saat ini

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.refresh();
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  // 3. Logic Penentu Style
  // Jika sedang di Homepage ("/"), ikuti logic scroll.
  // Jika di halaman lain (misal "/aktivitas"), paksa tampilkan mode glass/solid (true).
  const isHomePage = pathname === "/";
  const showGlassStyle = !isHomePage || isScrolled;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        // Gunakan variabel showGlassStyle
        showGlassStyle
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        
        {/* LOGO */}
        <Link 
          href="/" 
          className={cn(
            "flex items-center gap-2 font-bold text-xl tracking-tight transition-colors",
            showGlassStyle ? "text-slate-800" : "text-white"
          )}
        >
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <Home size={20} />
            </div>
            <span>Griya Mulya Asri</span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-blue-500",
                showGlassStyle ? "text-slate-600" : "text-white/90 hover:text-white"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* AUTH BUTTONS AREA (DESKTOP) */}
        <div className="hidden md:block">
            {user ? (
                <div className="relative">
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border",
                            showGlassStyle 
                                ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50" 
                                : "bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                        )}
                    >
                        <UserIcon size={16} />
                        <span className="text-sm font-medium max-w-[100px] truncate">
                            {user.displayName || "Warga"}
                        </span>
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            {user.role === 'admin' && (
                                <Link 
                                    href="/dashboard"
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                                >
                                    <LayoutDashboard size={16} />
                                    Dashboard Admin
                                </Link>
                            )}
                             <Link 
                                href={user.role === 'admin' ? "/dashboard" : "/warga"} 
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                            >
                                <UserIcon size={16} />
                                {user.role === 'admin' ? "Profil Saya" : "Dashboard Saya"}
                            </Link>
                            
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                            >
                                <LogOut size={16} />
                                Keluar
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <Button 
                    onClick={openLoginModal}
                    size="sm"
                    className={cn(
                        showGlassStyle 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "bg-white text-blue-900 hover:bg-gray-100"
                    )}
                >
                    Login Masuk
                </Button>
            )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          className="md:hidden p-2 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className={showGlassStyle ? "text-slate-800" : "text-white"} />
          ) : (
            <Menu className={showGlassStyle ? "text-slate-800" : "text-white"} />
          )}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-slate-700 font-medium hover:text-blue-600 py-2 border-b border-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          
          <div className="pt-4 border-t border-gray-100 mt-2">
            {user ? (
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 px-2 text-slate-500 text-sm mb-2">
                        <UserIcon size={16} />
                        Halo, <span className="font-semibold text-slate-800">{user.displayName}</span>
                    </div>
                    {user.role === 'admin' ? (
                        <Link href="/dashboard">
                            <Button className="w-full mb-2" variant="outline" onClick={() => setIsMobileMenuOpen(false)}>
                                Ke Dashboard
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/warga">
                            <Button className="w-full mb-2" variant="outline" onClick={() => setIsMobileMenuOpen(false)}>
                                Dashboard Saya
                            </Button>
                        </Link>
                    )}
                    <Button onClick={handleLogout} className="w-full" variant="danger">
                        Keluar
                    </Button>
                 </div>
            ) : (
                <Button onClick={() => { setIsMobileMenuOpen(false); openLoginModal(); }} className="w-full">
                    Login Masuk
                </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}