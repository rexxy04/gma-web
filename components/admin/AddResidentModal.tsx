"use client";

import { useState } from "react";
import { UserPlus, Save, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createResident } from "@/lib/services/user-service";

interface AddResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback untuk refresh tabel
}

export default function AddResidentModal({ isOpen, onClose, onSuccess }: AddResidentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    block: "",
    number: "",
    password: "warga123", // Default password
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await createResident(formData);
      alert("Warga berhasil ditambahkan!");
      onSuccess(); // Refresh data di halaman induk
      onClose();
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        block: "",
        number: "",
        password: "warga123",
      });
    } catch (error: any) {
      alert("Gagal: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Warga Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <Input
          label="Nama Lengkap (Kepala Keluarga)"
          name="name"
          placeholder="Contoh: Budi Santoso"
          required
          value={formData.name}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Blok Rumah"
            name="block"
            placeholder="A1"
            required
            value={formData.block}
            onChange={handleChange}
          />
          <Input
            label="Nomor Rumah"
            name="number"
            placeholder="12"
            required
            value={formData.number}
            onChange={handleChange}
          />
        </div>

        <Input
          label="No. WhatsApp"
          name="phone"
          type="tel"
          placeholder="0812..."
          required
          value={formData.phone}
          onChange={handleChange}
        />

        <div className="pt-2 border-t border-dashed">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Akun Login</h4>
            <Input
                label="Email"
                name="email"
                type="email"
                placeholder="email@warga.com"
                required
                value={formData.email}
                onChange={handleChange}
            />
            <Input
                label="Password Default"
                name="password"
                type="text"
                value={formData.password}
                onChange={handleChange}
                className="bg-slate-50"
            />
            <p className="text-xs text-slate-400 mt-1">
                *Berikan email & password ini kepada warga agar mereka bisa login.
            </p>
        </div>

        <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                Batal
            </Button>
            <Button type="submit" isLoading={isLoading} leftIcon={<Save size={16} />}>
                Simpan Data
            </Button>
        </div>

      </form>
    </Modal>
  );
}