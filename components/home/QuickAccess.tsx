"use client";

import { Wallet, Megaphone, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export default function QuickAccess() {
  return (
    <section id="menu-cepat" className="py-20 bg-white border-y border-slate-100">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Menu Cepat
          </h2>
          <p className="text-slate-500 text-lg">
            Akses layanan prioritas warga <span className="text-blue-600 font-semibold">Griya Mulya Asri</span> tanpa ribet.
          </p>
        </div>

        {/* 2 Big Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            
            {/* CARD 1: BAYAR IURAN (Theme: Blue) */}
            <div className="group relative overflow-hidden rounded-3xl bg-blue-50/50 border border-blue-100 p-8 lg:p-10 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl transition-transform group-hover:scale-110" />
                
                <div className="relative z-10 flex flex-col h-full items-start">
                    <div className="p-4 bg-blue-600 rounded-2xl text-white mb-6 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
                        <Wallet size={32} strokeWidth={1.5} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-700 transition-colors">
                        Bayar Iuran Warga
                    </h3>
                    
                    <p className="text-slate-600 mb-8 leading-relaxed flex-1">
                        Cek tagihan bulanan (kebersihan & keamanan) dan lakukan pembayaran digital dengan mudah, aman, dan tercatat otomatis.
                    </p>
                    
                    <Button variant="primary" size="lg" className="w-full sm:w-auto group-hover:pl-8 transition-all">
                        Bayar Sekarang <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>

            {/* CARD 2: LAPOR RT (Theme: Orange) */}
            <div className="group relative overflow-hidden rounded-3xl bg-orange-50/50 border border-orange-100 p-8 lg:p-10 hover:shadow-2xl hover:shadow-orange-900/10 transition-all duration-300">
                 {/* Background Decoration */}
                 <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl transition-transform group-hover:scale-110" />

                 <div className="relative z-10 flex flex-col h-full items-start">
                    <div className="p-4 bg-orange-500 rounded-2xl text-white mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                        <Megaphone size={32} strokeWidth={1.5} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-orange-700 transition-colors">
                        Lapor & Aduan
                    </h3>
                    
                    <p className="text-slate-600 mb-8 leading-relaxed flex-1">
                        Ada keluhan lingkungan? Atau butuh surat pengantar? Sampaikan laporan Anda langsung kepada pengurus RT melalui sistem ini.
                    </p>
                    
                    {/* Custom Style Button untuk menyesuaikan tema Orange */}
                    <Button 
                        size="lg" 
                        className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white shadow-orange-900/20 border-transparent group-hover:pl-8 transition-all"
                    >
                        Buat Laporan <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
}