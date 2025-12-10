"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ActivityGalleryProps {
  images: string[];
}

export default function ActivityGallery({ images }: ActivityGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
        setSelectedImageIndex((prev) => (prev! + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
        setSelectedImageIndex((prev) => (prev! - 1 + images.length) % images.length);
    }
  };

  return (
    <>
      {/* GRID LAYOUT (Tampilan di Sidebar) */}
      <div className="grid grid-cols-2 gap-2">
        {images.map((src, index) => (
          <div 
            key={index} 
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => openLightbox(index)}
          >
            <Image
              src={src}
              alt={`Galeri ${index}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 20vw"
            />
            {/* Overlay Icon saat hover */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="text-white drop-shadow-md" size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button 
                onClick={closeLightbox}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
            >
                <X size={24} />
            </button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
                <>
                    <button 
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button 
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                    >
                        <ChevronRight size={32} />
                    </button>
                </>
            )}

            {/* Main Image */}
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={selectedImageIndex} // Key agar animasi jalan saat ganti gambar
                className="relative w-full h-full max-w-5xl max-h-[85vh] p-4 flex items-center justify-center"
            >
                <div className="relative w-full h-full">
                    <Image
                        src={images[selectedImageIndex]}
                        alt="Preview"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                
                {/* Caption / Counter */}
                <div className="absolute bottom-4 left-0 w-full text-center text-white/70 text-sm">
                    {selectedImageIndex + 1} / {images.length}
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}