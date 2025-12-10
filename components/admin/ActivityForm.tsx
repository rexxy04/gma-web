"use client";

import { useState, useEffect } from "react";
import { Save, X, UploadCloud, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Activity } from "@/lib/types/firestore";
import { saveActivity, generateSlug } from "@/lib/services/activity-service";
import { useAuth } from "@/lib/context/AuthContext";

interface ActivityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Activity | null; // Jika ada isinya, berarti mode EDIT
}

export default function ActivityForm({ isOpen, onClose, onSuccess, initialData }: ActivityFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState<Partial<Activity>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    location: "",
    date: Date.now(),
    status: "published",
    isFeatured: false,
    gallery: [],
  });

  // File States
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);

  // Load Data saat Edit Mode
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset form jika mode create
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        location: "",
        date: Date.now(),
        status: "published",
        isFeatured: false,
        gallery: [],
      });
      setMainFile(null);
      setGalleryFiles(null);
    }
  }, [initialData, isOpen]);

  // Auto Generate Slug saat Title berubah (Hanya di mode Create)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: !initialData ? generateSlug(title) : prev.slug // Jangan ubah slug otomatis saat edit
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      await saveActivity(
        {
          ...formData,
          author: { uid: user.uid, displayName: user.displayName || "Admin" }
        },
        mainFile,
        galleryFiles,
        !!initialData
      );

      alert("Data berhasil disimpan!");
      onSuccess();
      onClose();
    } catch (error) {
      alert("Gagal menyimpan data.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper untuk format tanggal input (YYYY-MM-DD)
  const dateValue = formData.date 
    ? new Date(formData.date).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* SECTION 1: INFO DASAR */}
        <div className="space-y-4">
            <Input
              label="Judul Kegiatan"
              value={formData.title}
              onChange={handleTitleChange}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Slug (URL)"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="bg-slate-50 text-slate-500"
                  required
                />
                <Input
                  label="Tanggal Kegiatan"
                  type="date"
                  value={dateValue}
                  onChange={(e) => setFormData({...formData, date: new Date(e.target.value).getTime()})}
                  required
                />
            </div>

            <Input
              label="Lokasi"
              placeholder="Contoh: Lapangan Bulutangkis"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
        </div>

        {/* SECTION 2: KONTEN */}
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Deskripsi Singkat</label>
            <textarea
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                rows={2}
                placeholder="Ringkasan untuk kartu di halaman depan..."
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                required
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Konten Lengkap (Support HTML)</label>
            <textarea
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-200 outline-none font-mono"
                rows={6}
                placeholder="Tulis cerita lengkap di sini... Bisa gunakan tag <p>, <b>, dll."
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required
            />
        </div>

        {/* SECTION 3: MEDIA */}
        <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-100">
            <h4 className="font-semibold text-slate-800 text-sm">Media & Gambar</h4>
            
            {/* Main Image */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Foto Utama (Cover)</label>
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setMainFile(e.target.files ? e.target.files[0] : null)}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required={!initialData} // Wajib jika data baru
                />
                {initialData?.mainImage && (
                    <p className="text-xs text-green-600 mt-1">Sudah ada foto cover. Upload baru untuk mengganti.</p>
                )}
            </div>

            {/* Gallery */}
            <div className="space-y-1 pt-2 border-t border-slate-200">
                <label className="text-xs font-medium text-slate-500">Galeri Tambahan (Bisa pilih banyak)</label>
                <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={(e) => setGalleryFiles(e.target.files)}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {initialData?.gallery && initialData.gallery.length > 0 && (
                     <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <UploadCloud size={12} />
                        {initialData.gallery.length} foto tersimpan di galeri.
                     </div>
                )}
            </div>
        </div>

        {/* SECTION 4: SETTINGS */}
        <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Jadikan Featured (Headline)</span>
            </label>

            <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="ml-auto text-sm border-slate-200 rounded-lg p-2 bg-white"
            >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
            </select>
        </div>

        {/* ACTIONS */}
        <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
            <Button type="submit" isLoading={isLoading} leftIcon={<Save size={16} />}>
                Simpan Kegiatan
            </Button>
        </div>

      </form>
    </Modal>
  );
}