"use client";

import { useState, useEffect } from "react";
import { UploadCloud, CheckCircle, Copy, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AlertModal, { AlertType } from "@/components/ui/AlertModal";
import { useAuth } from "@/lib/context/AuthContext";
import { createPayment } from "@/lib/services/payment-service";
import { getPaymentMethods } from "@/lib/services/payment-method-service";
import { PaymentMethod } from "@/lib/types/firestore";
import Image from "next/image";

interface PayDuesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PayDuesModal({ isOpen, onClose }: PayDuesModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isMethodsLoading, setIsMethodsLoading] = useState(true);
  
  // Data Metode Pembayaran dari Admin
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");

  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type: AlertType }>({
    isOpen: false, title: "", message: "", type: "info"
  });

  const [formData, setFormData] = useState({
    amount: "100000",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Fetch Payment Methods saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      const fetchMethods = async () => {
        setIsMethodsLoading(true);
        const data = await getPaymentMethods();
        setMethods(data);
        // Default select metode pertama jika ada
        if (data.length > 0) setSelectedMethodId(data[0].id);
        setIsMethodsLoading(false);
      };
      fetchMethods();
    }
  }, [isOpen]);

  // Cari object method yang sedang dipilih
  const selectedMethod = methods.find(m => m.id === selectedMethodId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !proofFile) {
        setAlertState({isOpen: true, title: "Data Kurang", message: "Mohon upload bukti transfer.", type: "warning"});
        return;
    }
    
    setIsLoading(true);
    try {
      await createPayment(
        {
          userId: user.uid,
          amount: parseInt(formData.amount.replace(/\D/g, "")),
          month: Number(formData.month),
          year: Number(formData.year),
          paymentMethod: selectedMethod ? selectedMethod.name : "Transfer Bank", // Simpan nama metodenya
        },
        proofFile
      );
      
      setAlertState({
        isOpen: true,
        title: "Pembayaran Terkirim",
        message: "Terima kasih! Bukti pembayaran Anda sedang diverifikasi oleh bendahara.",
        type: "success"
      });

      // Reset
      setProofFile(null);

    } catch (error) {
      setAlertState({isOpen: true, title: "Gagal Mengirim", message: "Terjadi kesalahan sistem.", type: "error"});
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertClose = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
    if (alertState.type === "success") onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Bayar Iuran Bulanan">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 1. SECTION INFO REKENING (DINAMIS) */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 transition-all">
             {isMethodsLoading ? (
                 <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-500"/></div>
             ) : methods.length > 0 ? (
                 <>
                    {/* Dropdown Pilihan */}
                    <div className="mb-4">
                        <label className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1.5 block">Metode Pembayaran</label>
                        <select 
                            className="w-full p-2.5 rounded-lg border border-blue-200 bg-white text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-300 outline-none"
                            value={selectedMethodId}
                            onChange={(e) => setSelectedMethodId(e.target.value)}
                        >
                            {methods.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.type === 'qris' ? `📷 ${m.name}` : `🏦 ${m.name}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Detail Tampilan (Bank vs QRIS) */}
                    {selectedMethod?.type === 'qris' ? (
                        <div className="text-center bg-white p-4 rounded-lg border border-blue-100">
                             <p className="text-sm font-medium text-slate-500 mb-2">Scan QRIS ini:</p>
                             <div className="relative w-40 h-40 mx-auto">
                                {selectedMethod.qrisImageUrl && (
                                    <Image src={selectedMethod.qrisImageUrl} alt="QRIS" fill className="object-contain" />
                                )}
                             </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-1">
                             <p className="text-sm text-slate-500">Silakan transfer ke:</p>
                             <div className="flex items-center justify-center gap-2">
                                <p className="text-xl font-bold text-slate-800">{selectedMethod?.accountNumber}</p>
                                <button type="button" onClick={() => navigator.clipboard.writeText(selectedMethod?.accountNumber || "")} className="text-blue-500 hover:text-blue-700"><Copy size={16}/></button>
                             </div>
                             <p className="text-sm font-medium text-slate-600">a.n. {selectedMethod?.accountHolder}</p>
                        </div>
                    )}
                 </>
             ) : (
                 <p className="text-center text-sm text-slate-500">Belum ada metode pembayaran tersedia.</p>
             )}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Bulan</label>
                <select 
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm bg-white"
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
                >
                    {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{new Date(0, m-1).toLocaleString('id-ID', {month: 'long'})}</option>
                    ))}
                </select>
             </div>
             <Input 
                label="Tahun"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
             />
          </div>

          <Input 
            label="Nominal"
            value={formData.amount}
            disabled // Nominal dikunci Rp 100.000 (sesuai request awal), bisa diubah jika perlu
            className="bg-slate-50 text-slate-500"
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Upload Bukti Transfer</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors relative">
                <input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)}
                    required
                />
                <div className="flex flex-col items-center gap-1 pointer-events-none">
                    <UploadCloud className="text-slate-400" size={24} />
                    {proofFile ? (
                        <p className="text-xs text-green-600 font-medium truncate max-w-[200px]">{proofFile.name}</p>
                    ) : (
                        <p className="text-xs text-slate-500">Klik untuk upload foto</p>
                    )}
                </div>
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Kirim Bukti Pembayaran
          </Button>

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