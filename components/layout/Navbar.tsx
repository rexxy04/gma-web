// src/components/layout/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Home } from "lucide-react"; 
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button"; // Import Button Reusable
import { useUI } from "@/lib/context/UIContext"; // Import Context

const navItems = [
  { name: "Aktivitas Warga", href: "#aktivitas" },
  { name: "Menu Cepat", href: "#menu-cepat" },
  { name: "Jadwal Kegiatan", href: "#jadwal" },
  { name: "Dokumentasi", href: "#dokumentasi" },
  { name: "Kepengurusan", href: "#kepengurusan" },
];

export default function Navbar() {
  // FIX: Ambil fungsi openLoginModal dari Context
  const { openLoginModal } = useUI(); 

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Efek scroll glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled
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
            isScrolled ? "text-slate-800" : "text-white"
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
                isScrolled ? "text-slate-600" : "text-white/90 hover:text-white"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* LOGIN BUTTON (DESKTOP) - Menggunakan Reusable Button */}
        <div className="hidden md:block">
            <Button 
                onClick={openLoginModal}
                size="sm"
                // Logic styling: Jika discroll pakai style primary biasa, 
                // jika di atas (transparent bg) pakai style putih/ghost agar kontras
                className={cn(
                    isScrolled 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "bg-white text-blue-900 hover:bg-gray-100"
                )}
            >
                Login Pengurus
            </Button>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          className="md:hidden p-2 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className={isScrolled ? "text-slate-800" : "text-white"} />
          ) : (
            <Menu className={isScrolled ? "text-slate-800" : "text-white"} />
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
          
          {/* Tombol Login Mobile */}
          <Button
            onClick={() => {
                setIsMobileMenuOpen(false);
                openLoginModal();
            }}
            className="w-full"
          >
            Login Pengurus
          </Button>
        </div>
      )}
    </nav>
  );
}