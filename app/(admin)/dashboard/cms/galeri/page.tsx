"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import { getGalleryItems, uploadGalleryItem, deleteGalleryItem } from "@/lib/services/gallery-service";
import { GalleryItem } from "@/lib/types/firestore";

export default function CMSGaleriPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Referensi ke input file tersembunyi

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    const data = await getGalleryItems();
    setItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Upload (Bisa pilih banyak file)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Upload file satu per satu secara paralel
      const uploadPromises = Array.from(files).map(file => uploadGalleryItem(file));
      await Promise.all(uploadPromises);
      
      fetchData(); // Refresh grid setelah selesai
      alert(`${files.length} foto berhasil diupload!`);
    } catch (error) {
      console.error(error);
      alert("Gagal mengupload sebagian atau semua foto.");
    } finally {
      setIsUploading(false);
      // Reset input file agar bisa pilih file yang sama lagi jika perlu
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, storagePath: string) => {
    if (!confirm("Yakin ingin menghapus foto ini secara permanen?")) return;

    try {
      // Hapus dari UI dulu biar cepat (optimistic update)
      setItems(prev => prev.filter(item => item.id !== id));
      // Proses hapus di backend
      await deleteGalleryItem(id, storagePath);
    } catch (error) {
      alert("Gagal menghapus foto.");
      fetchData(); // Rollback jika gagal
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Galeri Homepage</h1>
          <p className="text-slate-500">Upload foto untuk ditampilkan di running text halaman depan.</p>
        </div>
        <div>
          {/* Input File Tersembunyi */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            multiple 
            accept="image/*" 
            className="hidden"
          />
          {/* Tombol Pemicu */}
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            leftIcon={isUploading ? <Loader2 className="animate-spin" size={18}/> : <UploadCloud size={18} />}
            disabled={isUploading || isLoading}
          >
            {isUploading ? "Mengupload..." : "Upload Foto Baru"}
          </Button>
        </div>
      </div>

      {/* GRID FOTO */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {isLoading ? (
           <div className="text-center py-12 text-slate-500">Memuat galeri...</div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="group relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                <Image
                  src={item.url}
                  alt="Gallery item"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {/* Delete Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                        onClick={() => handleDelete(item.id, item.storagePath)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Hapus Foto"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 flex flex-col items-center gap-3 text-slate-500">
             <div className="p-4 bg-slate-100 rounded-full">
                <ImageIcon size={32} className="text-slate-400" />
             </div>
             <p>Belum ada foto di galeri.</p>
             <p className="text-sm">Klik tombol upload untuk menambahkan.</p>
          </div>
        )}
      </div>
      
      <p className="text-sm text-slate-500 italic">
          *Tips: Agar tampilan marquee di homepage terlihat bagus, disarankan mengupload minimal 6-8 foto dengan orientasi landscape (lebar).
      </p>
    </div>
  );
}