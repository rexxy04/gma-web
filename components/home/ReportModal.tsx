"use client";

import { useState } from "react";
import { UploadCloud, Send } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AlertModal, { AlertType } from "@/components/ui/AlertModal"; // 1. Import AlertModal
import { useAuth } from "@/lib/context/AuthContext";
import { createComplaint } from "@/lib/services/complaint-service";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. State untuk Alert Custom
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      await createComplaint(user.uid, formData, file);
      
      // 3. Ganti alert() sukses dengan setAlertState
      setAlertState({
        isOpen: true,
        title: "Laporan Terkirim!",
        message: "Laporan Anda telah masuk ke sistem dan akan segera ditinjau oleh pengurus.",
        type: "success"
      });

      // Reset Form
      setFormData({ title: "", description: "" });
      setFile(null);
      
      // Note: Kita TIDAK memanggil onClose() di sini agar user melihat alert sukses dulu.
      // Kita akan handle onClose di tombol "Oke" pada alert sukses.

    } catch (error) {
      // 4. Ganti alert() gagal dengan setAlertState
      setAlertState({
        isOpen: true,
        title: "Gagal Mengirim",
        message: "Terjadi kesalahan saat mengirim laporan. Silakan coba lagi nanti.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler saat tombol "Oke" pada Alert ditekan
  const handleAlertClose = () => {
    setAlertState({ ...alertState, isOpen: false });
    
    // Jika sukses, tutup modal laporan utama juga
    if (alertState.type === "success") {
        onClose();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Buat Laporan / Aduan">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-sm text-orange-800 mb-2">
              Laporan Anda akan masuk ke sistem Admin dan ditindaklanjuti sesuai urgensi.
          </div>

          <Input
              label="Judul Laporan"
              placeholder="Contoh: Lampu PJU Mati / Sampah Menumpuk"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
          />

          <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Detail Masalah</label>
              <textarea
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                  rows={3}
                  placeholder="Jelaskan lokasi dan detail masalah..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
              />
          </div>

          <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Foto Bukti (Opsional)</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors relative">
                  <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                              setFile(e.target.files[0]);
                          }
                      }}
                  />
                  <div className="flex flex-col items-center gap-1 pointer-events-none">
                      <UploadCloud className="text-slate-400" size={20} />
                      {file ? (
                          <p className="text-xs text-green-600 font-medium truncate max-w-[200px]">{file.name}</p>
                      ) : (
                          <p className="text-xs text-slate-500">Klik untuk upload foto</p>
                      )}
                  </div>
              </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Batal</Button>
              <Button type="submit" isLoading={isLoading} leftIcon={<Send size={16} />}>
                  Kirim Laporan
              </Button>
          </div>

        </form>
      </Modal>

      {/* 5. Render AlertModal di luar Modal utama */}
      <AlertModal 
        isOpen={alertState.isOpen}
        onClose={handleAlertClose}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </>
  );
}