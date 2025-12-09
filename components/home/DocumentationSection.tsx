"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

// DUMMY DATA FOTO (Gunakan foto dari Unsplash yang orientasinya Landscape/Lebar)
const DOC_IMAGES = [
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop", // Kerja bakti
  "https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=80&w=600&auto=format&fit=crop", // Rapat/Kumpul
  "https://images.unsplash.com/photo-1560439514-4e9645039924?q=80&w=600&auto=format&fit=crop", // Kegiatan sosial
  "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=600&auto=format&fit=crop", // Gotong royong
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&auto=format&fit=crop", // Diskusi warga
  "https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=600&auto=format&fit=crop", // Event outdoor
];

// --- MAIN COMPONENT ---
export default function DocumentationSection() {
  return (
    <section id="dokumentasi" className="py-24 bg-white overflow-hidden relative">
      {/* Background accent (optional) */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-slate-50 to-transparent" />

      <div className="container mx-auto px-4 mb-16 text-center relative z-10">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
            <Camera size={16} />
            Galeri Warga
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
          Dokumentasi Kegiatan
        </h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Momen-momen kebersamaan dan gotong royong yang terekam lensa di lingkungan Griya Mulya Asri.
        </p>
      </div>

      {/* AREA CAROUSEL */}
      {/* Kita tambahkan class hover-pause di wrapper agar saat mouse masuk, animasi berhenti */}
      <div className="space-y-6 md:space-y-8 hover-pause">
        
        {/* ROW 1: SPEED CEPAT */}
        {/* Kita putar sedikit (rotate) agar terlihat lebih dinamis */}
        <div className="rotate-[-1deg] scale-105 origin-center">
            <MarqueeRow images={DOC_IMAGES} speed="fast" />
        </div>

        {/* ROW 2: SPEED LAMBAT & ARAH SEBALIKNYA */}
        <div className="rotate-[1deg] scale-105 origin-center">
            {/* Saya pakai 'slow-reverse' agar arahnya beda dari yang atas, lebih keren */}
            <MarqueeRow images={[...DOC_IMAGES].reverse()} speed="slow-reverse" />
        </div>

      </div>
       
      {/* Overlay gradient di kiri kanan agar gambar terlihat 'keluar/masuk' secara halus */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white z-10"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white z-10"></div>
    </section>
  );
}

// --- SUB-COMPONENT: MARQUEE ROW ---
// Ini komponen untuk membuat satu baris gambar yang berulang
interface MarqueeRowProps {
    images: string[];
    speed: "fast" | "slow" | "slow-reverse";
}

function MarqueeRow({ images, speed }: MarqueeRowProps) {
    // Pilih class animasi berdasarkan prop speed
    const animationClass = {
        "fast": "animate-marquee-fast",
        "slow": "animate-marquee-slow",
        "slow-reverse": "animate-marquee-slow-reverse",
    }[speed];

    // Komponen untuk merender daftar gambar
    const ImageList = () => (
        <>
            {images.map((src, index) => (
                // Wrapper gambar dengan ukuran tetap agar rapi
                <div 
                    key={index} 
                    className="relative h-48 w-72 md:h-64 md:w-96 flex-shrink-0 rounded-2xl overflow-hidden border-4 border-white shadow-md grayscale-[20%] hover:grayscale-0 transition-all duration-300"
                >
                    <Image
                        src={src}
                        alt={`Dokumentasi ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 288px, 384px" // Optimasi ukuran gambar
                    />
                </div>
            ))}
        </>
    );

    return (
        // Container luar overflow hidden
        <div className="flex overflow-hidden select-none gap-6 py-4">
            {/* Trik Infinite Loop:
               Kita render 2 set gambar identik secara berdampingan.
               Kedua set ini bergerak bersamaan menggunakan animasi CSS.
               Saat set pertama selesai bergeser keluar layar, set kedua sudah menggantikannya,
               menciptakan ilusi tanpa henti.
            */}
            
            {/* Set Gambar 1 */}
            <div className={cn("flex flex-shrink-0 gap-6 items-center", animationClass)}>
                <ImageList />
            </div>
            {/* Set Gambar 2 (Duplikat) */}
            <div className={cn("flex flex-shrink-0 gap-6 items-center", animationClass)} aria-hidden="true">
                <ImageList />
            </div>
        </div>
    );
}