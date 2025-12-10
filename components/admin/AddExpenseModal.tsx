"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/lib/context/AuthContext";
import { createExpense } from "@/lib/services/expense-service";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddExpenseModal({ isOpen, onClose, onSuccess }: AddExpenseModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split('T')[0], // Default hari ini
    category: "Operasional",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      await createExpense({
        title: formData.title,
        amount: Number(formData.amount),
        date: new Date(formData.date).getTime(),
        category: formData.category,
        recordedBy: user.uid,
      });

      alert("Pengeluaran berhasil dicatat!");
      onSuccess();
      onClose();
      // Reset Form
      setFormData({
        title: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        category: "Operasional",
      });
    } catch (error) {
      alert("Gagal menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Catat Pengeluaran Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <Input
            label="Keperluan"
            placeholder="Contoh: Bayar Petugas Sampah"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
        />

        <div className="grid grid-cols-2 gap-4">
            <Input
                label="Nominal (Rp)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
            />
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Kategori</label>
                <select 
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-200"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                    <option value="Operasional">Operasional</option>
                    <option value="Pembangunan">Pembangunan / Fisik</option>
                    <option value="Sosial">Sosial / Santunan</option>
                    <option value="Lainnya">Lainnya</option>
                </select>
            </div>
        </div>

        <Input
            label="Tanggal"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
        />

        <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
            <Button type="submit" isLoading={isLoading} leftIcon={<Save size={16} />}>
                Simpan
            </Button>
        </div>

      </form>
    </Modal>
  );
}