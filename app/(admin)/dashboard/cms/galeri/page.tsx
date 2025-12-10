"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import AlertModal, { AlertType } from "@/components/ui/AlertModal"; // 1. Import AlertModal
import { getGalleryItems, uploadGalleryItem, deleteGalleryItem } from "@/lib/services/gallery-service";
import { GalleryItem } from "@/lib/types/firestore";

export default function CMSGaleriPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. State Alert
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
    onConfirm?: () => void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const fetchData = async () => {
    setIsLoading(true);
    const data = await getGalleryItems();
    setItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadGalleryItem(file));
      await Promise.all(uploadPromises);
      
      // Alert Sukses Upload
      setAlertState({
        isOpen: true,
        title: "Upload Berhasil",
        message: `${files.length} foto berhasil ditambahkan ke galeri.`,
        type: "success"
      });

      fetchData();
    } catch (error) {
       setAlertState({
        isOpen: true,
        title: "Gagal Upload",
        message: "Terjadi kesalahan saat mengupload foto.",
        type: "error"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 3. Trigger Konfirmasi Hapus
  const handleDeleteClick = (id: string, storagePath: string) => {
    setAlertState({
        isOpen: true,
        title: "Hapus Foto?",
        message: "Foto ini akan dihapus permanen dari galeri website. Lanjutkan?",
        type: "warning",
        onConfirm: () => processDelete(id, storagePath),
    });
  };

  // 4. Proses Hapus
  const processDelete = async (id: string, storagePath: string) => {
    setAlertState(prev => ({ ...prev, isLoading: true }));
    try {
      setItems(prev => prev.filter(item => item.id !== id)); // Optimistic UI
      await deleteGalleryItem(id, storagePath);
      
      setAlertState({
        isOpen: true,
        title: "Foto Dihapus",
        message: "Foto berhasil dihapus dari galeri.",
        type: "success",
        onConfirm: undefined,
        isLoading: false
      });
    } catch (error) {
       setAlertState({
        isOpen: true,
        title: "Gagal Menghapus",
        message: "Terjadi kesalahan sistem.",
        type: "error",
        onConfirm: undefined,
        isLoading: false
      });
      fetchData(); // Rollback
    }
  };

  const handleAlertClose = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
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
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            multiple 
            accept="image/*" 
            className="hidden"
          />
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
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                        onClick={() => handleDeleteClick(item.id, item.storagePath)} // <--- Ganti logic
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
          </div>
        )}
      </div>
      
      {/* 5. Render Alert */}
      <AlertModal 
        isOpen={alertState.isOpen}
        onClose={handleAlertClose}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={alertState.onConfirm}
        isLoading={alertState.isLoading}
      />
    </div>
  );
}