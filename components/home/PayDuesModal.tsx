"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { submitResidentPayment } from "@/lib/services/payment-service";
import { useAuth } from "@/lib/context/AuthContext";

interface PayDuesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PayDuesModal({ isOpen, onClose }: PayDuesModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  
  // Form State
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [amount] = useState(100000); // Nominal tetap (Bisa dibuat dinamis nanti)
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;

    setIsLoading(true);
    try {
      await submitResidentPayment(file, {
        userId: user.uid,
        amount,
        month,
        year
      });
      setStep("success");
    } catch (error) {
      alert("Gagal mengirim pembayaran. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("form");
    setFile(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bayar Iuran Bulanan">
      {step === "success" ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Terima Kasih!</h3>
          <p className="text-slate-500 mb-6">
            Bukti pembayaran Anda telah terkirim. Pengurus akan memverifikasi data Anda dalam 1x24 jam.
          </p>
          <Button onClick={handleClose} className="w-full">Tutup</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Info Rekening */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm">
            <p className="text-slate-500 mb-1">Silakan transfer ke rekening:</p>
            <p className="font-bold text-slate-800 text-lg">BCA 123-456-7890</p>
            <p className="text-slate-600">a.n. Bendahara RT 007</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Bulan</label>
                <select 
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                    {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>
            <Input 
                label="Tahun" 
                type="number" 
                value={year} 
                onChange={(e) => setYear(parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Nominal</label>
            <div className="bg-slate-100 px-3 py-2.5 rounded-lg text-slate-500 font-medium">
                Rp {amount.toLocaleString("id-ID")}
            </div>
          </div>

          {/* Upload File */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Bukti Transfer</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                <input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            setFile(e.target.files[0]);
                        }
                    }}
                    required
                />
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <UploadCloud className="text-blue-500" size={24} />
                    {file ? (
                        <p className="text-sm text-green-600 font-medium truncate max-w-[200px]">{file.name}</p>
                    ) : (
                        <p className="text-sm text-slate-500">Klik untuk upload foto</p>
                    )}
                </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg" 
            isLoading={isLoading}
            disabled={!file} // Disable jika belum upload
          >
            Kirim Bukti Pembayaran
          </Button>
        </form>
      )}
    </Modal>
  );
}