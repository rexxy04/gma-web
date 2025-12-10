"use client";

import { useState, useEffect } from "react";
import { UserPlus, Save, X, Edit } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createResident, updateResident } from "@/lib/services/user-service";
import { UserProfile } from "@/lib/types/firestore";

interface AddResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: UserProfile | null; // Prop baru untuk mode Edit
}

export default function AddResidentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialData 
}: AddResidentModalProps) {
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    block: "",
    number: "",
    password: "warga123",
  });

  // Effect: Isi form jika ada initialData (Mode Edit)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.displayName || "",
        email: initialData.email || "",
        phone: initialData.phoneNumber || "",
        block: initialData.houseBlock || "",
        number: initialData.houseNumber || "",
        password: "", // Password dikosongkan saat edit (tidak diupdate kecuali perlu logic khusus)
      });
    } else {
      // Reset jika Mode Tambah
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
          // Email & Password biasanya tidak diupdate sembarangan di sini
        });
        alert("Data warga berhasil diperbarui!");
      } else {
        // --- LOGIC CREATE ---
        await createResident(formData);
        alert("Warga berhasil ditambahkan!");
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      alert("Gagal: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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

        {/* Email & Password hanya bisa diedit saat CREATE (untuk simplifikasi) */}
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
  );
}