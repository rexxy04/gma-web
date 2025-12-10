"use client";

import { useState, useEffect } from "react";
import { UserPlus, Edit } from "lucide-react"; // Hapus Save, X jika tidak dipakai
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AlertModal, { AlertType } from "@/components/ui/AlertModal"; // 1. Import AlertModal
import { createResident, updateResident } from "@/lib/services/user-service";
import { UserProfile } from "@/lib/types/firestore";

interface AddResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: UserProfile | null;
}

export default function AddResidentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialData 
}: AddResidentModalProps) {
  
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
    name: "",
    email: "",
    phone: "",
    block: "",
    number: "",
    password: "warga123",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.displayName || "",
        email: initialData.email || "",
        phone: initialData.phoneNumber || "",
        block: initialData.houseBlock || "",
        number: initialData.houseNumber || "",
        password: "", 
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        block: "",
        number: "",
        password: "warga123",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (initialData) {
        // --- LOGIC UPDATE ---
        await updateResident(initialData.uid, {
          displayName: formData.name,
          phoneNumber: formData.phone,
          houseBlock: formData.block,
          houseNumber: formData.number,
        });
        
        // 3. Alert Sukses Edit
        setAlertState({
            isOpen: true,
            title: "Berhasil Diperbarui",
            message: "Data warga telah berhasil disimpan.",
            type: "success"
        });

      } else {
        // --- LOGIC CREATE ---
        await createResident(formData);
        
        // 4. Alert Sukses Tambah
        setAlertState({
            isOpen: true,
            title: "Warga Ditambahkan",
            message: "Akun warga berhasil dibuat. Silakan informasikan email & password kepada warga yang bersangkutan.",
            type: "success"
        });
      }
      
      // Note: Kita TIDAK memanggil onClose() di sini agar user baca alert dulu.
      
    } catch (error: any) {
      // 5. Alert Gagal
      setAlertState({
        isOpen: true,
        title: "Gagal Menyimpan",
        message: error.message || "Terjadi kesalahan saat menyimpan data.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Handle saat tombol alert "Oke" diklik
  const handleAlertClose = () => {
    setAlertState({ ...alertState, isOpen: false });

    // Jika tipe sukses, baru tutup modal utama dan refresh tabel
    if (alertState.type === "success") {
        onSuccess(); // Refresh tabel
        onClose();   // Tutup modal
    }
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={initialData ? "Edit Data Warga" : "Tambah Warga Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <Input
            label="Nama Lengkap"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Blok"
              name="block"
              value={formData.block}
              onChange={handleChange}
              required
            />
            <Input
              label="Nomor"
              name="number"
              value={formData.number}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            label="No. WhatsApp"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          {!initialData && (
              <div className="pt-2 border-t border-dashed">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Akun Login</h4>
                  <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                  />
                  <Input
                      label="Password Default"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-slate-50"
                  />
              </div>
          )}

          <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
              <Button type="submit" isLoading={isLoading} leftIcon={initialData ? <Edit size={16}/> : <UserPlus size={16}/>}>
                  {initialData ? "Simpan Perubahan" : "Tambah Warga"}
              </Button>
          </div>

        </form>
      </Modal>

      {/* 7. Render AlertModal */}
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