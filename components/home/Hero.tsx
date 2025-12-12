"use client";

import Image from "next/image";
import Link from "next/link"; // Import Link untuk navigasi dashboard
import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react"; // Import Icon Dashboard
import Button from "@/components/ui/Button"; 
import { useUI } from "@/lib/context/UIContext"; 
import { useAuth } from "@/lib/context/AuthContext"; // Import Auth Context

export default function Hero() {
  const { openLoginModal } = useUI(); 
  const { user } = useAuth(); // Ambil status user login

  // Helper untuk scroll halus ke section aktivitas
  const handleExploreClick = () => {
    const section = document.getElementById("aktivitas");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      
      {/* 1. BACKGROUND IMAGE (Tetap menggunakan gambar lokal Anda) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Gerbang Griya Mulya Asri"
          fill
          className="object-cover object-center"
          priority
        />
        
        {/* 2. OVERLAY */}
        <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/30" />
      </div>

      {/* 3. CONTENT TEXT */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-4"
        >
          {/* Badge Kecil */}
          <span className="inline-block py-1 px-3 rounded-full bg-blue-600/30 border border-blue-400/30 text-blue-200 text-xs md:text-sm font-medium backdrop-blur-sm mb-2">
            Selamat datang di
          </span>

          {/* JUDUL UTAMA */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight drop-shadow-lg">
            Website Resmi <br />
            <span className="text-blue-400">Griya Mulya Asri</span>
          </h1>

          {/* SUB JUDUL / ALAMAT */}
          <p className="text-lg md:text-xl text-gray-200 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Kelurahan Pai, Kecamatan Biringkanaya <br className="hidden md:block" />
            RT 007 / RW 008
          </p>

          {/* CTA BUTTONS - LOGIC DIPERBAIKI (ISSUE 5 FIX) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Tombol Jelajahi (Primary) */}
            <Button 
                onClick={handleExploreClick}
                size="lg"
                className="w-full sm:w-auto"
            >
                Jelajahi
            </Button>

            {/* LOGIC TOMBOL LOGIN / DASHBOARD */}
            {user ? (
                // JIKA SUDAH LOGIN: Tampilkan Tombol Ke Dashboard
                <Link href={user.role === 'admin' ? "/dashboard" : "/warga"} className="w-full sm:w-auto">
                    <Button 
                        variant="glass" 
                        size="lg"
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <LayoutDashboard size={18} />
                        Ke Dashboard
                    </Button>
                </Link>
            ) : (
                // JIKA BELUM LOGIN: Tampilkan Tombol Login
                <Button 
                    variant="glass" 
                    onClick={openLoginModal}
                    size="lg"
                    className="w-full sm:w-auto"
                >
                    Login Warga
                </Button>
            )}

          </motion.div>
        </motion.div>
      </div>

      {/* 4. SCROLL INDICATOR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1, duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full animate-scroll-down" />
        </div>
      </motion.div>
    </section>
  );
}