"use client";

import Image from "next/image";
import { Camera, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GalleryItem } from "@/lib/types/firestore"; // Import Type

// Terima Data lewat Props
interface DocumentationSectionProps {
  items: GalleryItem[];
}

export default function DocumentationSection({ items }: DocumentationSectionProps) {
  // Jika tidak ada foto, jangan tampilkan section ini (atau tampilkan fallback)
  if (!items || items.length === 0) {
    return null; 
  }

  // Ambil hanya URL gambar dari object GalleryItem
  const imageUrls = items.map(item => item.url);

  return (
    <section id="dokumentasi" className="py-24 bg-white overflow-hidden relative">
      {/* Background accent */}
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
      <div className="space-y-6 md:space-y-8 hover-pause">
        
        {/* ROW 1: SPEED CEPAT */}
        <div className="rotate-[-1deg] scale-105 origin-center">
            <MarqueeRow images={imageUrls} speed="fast" />
        </div>

        {/* ROW 2: SPEED LAMBAT & ARAH SEBALIKNYA */}
        {/* Jika foto sedikit (< 5), mungkin row kedua akan terlihat duplikat persis. 
            Idealnya hanya render Row 2 jika foto cukup banyak. 
            Tapi untuk sekarang kita render saja agar desain tetap konsisten. */}
        <div className="rotate-[1deg] scale-105 origin-center">
            {/* Kita reverse array-nya agar urutan fotonya beda dengan row atas */}
            <MarqueeRow images={[...imageUrls].reverse()} speed="slow-reverse" />
        </div>

      </div>
       
      {/* Overlay gradient */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white z-10"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white z-10"></div>
    </section>
  );
}

// --- SUB-COMPONENT: MARQUEE ROW ---
interface MarqueeRowProps {
    images: string[];
    speed: "fast" | "slow" | "slow-reverse";
}

function MarqueeRow({ images, speed }: MarqueeRowProps) {
    const animationClass = {
        "fast": "animate-marquee-fast",
        "slow": "animate-marquee-slow",
        "slow-reverse": "animate-marquee-slow-reverse",
    }[speed];

    // Jika gambar sedikit, kita duplikasi list-nya beberapa kali agar marquee tidak putus
    // Minimal kita butuh cukup gambar untuk memenuhi lebar layar
    const multiplier = images.length < 5 ? 4 : 2; 
    
    // Fungsi render list gambar
    const ImageList = () => (
        <>
            {images.map((src, index) => (
                <div 
                    key={`${index}-${src}`} // Gunakan index unik
                    className="relative h-48 w-72 md:h-64 md:w-96 flex-shrink-0 rounded-2xl overflow-hidden border-4 border-white shadow-md grayscale-[20%] hover:grayscale-0 transition-all duration-300"
                >
                    <Image
                        src={src}
                        alt="Dokumentasi Warga"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 288px, 384px"
                    />
                </div>
            ))}
        </>
    );

    return (
        <div className="flex overflow-hidden select-none gap-6 py-4">
            {/* Render loop berdasarkan multiplier agar marquee mulus walaupun foto sedikit */}
            {Array.from({ length: multiplier }).map((_, i) => (
                <div key={i} className={cn("flex flex-shrink-0 gap-6 items-center", animationClass)}>
                    <ImageList />
                </div>
            ))}
        </div>
    );
}