"use client";

import { useState } from "react";
import { Save, UploadCloud, CreditCard, QrCode } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AlertModal, { AlertType } from "@/components/ui/AlertModal";
import { savePaymentMethod } from "@/lib/services/payment-method-service";
import { PaymentMethod } from "@/lib/types/firestore";

interface PaymentMethodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentMethodForm({ isOpen, onClose, onSuccess }: PaymentMethodFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // State Alert
  const [alertState, setAlertState] = useState<{
    isOpen: boolean; title: string; message: string; type: AlertType;
  }>({ isOpen: false, title: "", message: "", type: "info" });

  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    type: "bank",
    name: "",
    accountNumber: "",
    accountHolder: "",
  });
  const [qrisFile, setQrisFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.type === 'qris' && !qrisFile) {
        throw new Error("Wajib upload gambar QRIS.");
      }

      await savePaymentMethod(formData, qrisFile);

      setAlertState({
        isOpen: true,
        title: "Berhasil Disimpan",
        message: "Metode pembayaran baru telah ditambahkan.",
        type: "success"
      });
      
      // Reset
      setFormData({ type: "bank", name: "", accountNumber: "", accountHolder: "" });
      setQrisFile(null);

    } catch (error: any) {
      setAlertState({
        isOpen: true,
        title: "Gagal Menyimpan",
        message: error.message || "Terjadi kesalahan sistem.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertClose = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
    if (alertState.type === "success") {
        onSuccess();
        onClose();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Tambah Metode Pembayaran">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* PILIH TIPE */}
          <div className="grid grid-cols-2 gap-4">
             <div 
                onClick={() => setFormData({...formData, type: 'bank'})}
                className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${formData.type === 'bank' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}
             >
                <CreditCard size={24} />
                <span className="text-sm font-medium">Transfer Bank</span>
             </div>
             <div 
                onClick={() => setFormData({...formData, type: 'qris'})}
                className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${formData.type === 'qris' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}
             >
                <QrCode size={24} />
                <span className="text-sm font-medium">QRIS Code</span>
             </div>
          </div>

          <Input
            label={formData.type === 'bank' ? "Nama Bank" : "Label QRIS"}
            placeholder={formData.type === 'bank' ? "Contoh: Bank BCA" : "Contoh: QRIS Kas RT"}
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />

          {formData.type === 'bank' ? (
             <>
                <Input
                    label="Nomor Rekening"
                    type="number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    required
                />
                <Input
                    label="Atas Nama"
                    placeholder="Contoh: Bendahara RT 007"
                    value={formData.accountHolder}
                    onChange={(e) => setFormData({...formData, accountHolder: e.target.value})}
                    required
                />
             </>
          ) : (
             <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Upload Gambar QRIS</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                    <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => setQrisFile(e.target.files ? e.target.files[0] : null)}
                        required
                    />
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                        <UploadCloud className="text-slate-400" size={24} />
                        {qrisFile ? (
                            <p className="text-sm text-green-600 font-medium">{qrisFile.name}</p>
                        ) : (
                            <div className="text-xs text-slate-500">
                                <p className="font-medium text-slate-700">Klik untuk upload QRIS</p>
                                <p>Format: JPG, PNG</p>
                            </div>
                        )}
                    </div>
                </div>
             </div>
          )}

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
              <Button type="submit" isLoading={isLoading} leftIcon={<Save size={16} />}>Simpan</Button>
          </div>

        </form>
      </Modal>

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