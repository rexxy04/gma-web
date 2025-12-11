"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, CreditCard, QrCode } from "lucide-react";
import Button from "@/components/ui/Button";
import PaymentMethodForm from "@/components/admin/PaymentMethodForm";
import AlertModal, { AlertType } from "@/components/ui/AlertModal";
import { getPaymentMethods, deletePaymentMethod } from "@/lib/services/payment-method-service";
import { PaymentMethod } from "@/lib/types/firestore";
import Image from "next/image";

export default function MetodePembayaranPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [alertState, setAlertState] = useState<{
    isOpen: boolean; title: string; message: string; type: AlertType; onConfirm?: () => void;
  }>({ isOpen: false, title: "", message: "", type: "info" });

  const fetchData = async () => {
    setIsLoading(true);
    const data = await getPaymentMethods();
    setMethods(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id: string, qrisUrl?: string) => {
    setAlertState({
        isOpen: true,
        title: "Hapus Metode?",
        message: "Metode pembayaran ini tidak akan muncul lagi di halaman warga.",
        type: "warning",
        onConfirm: async () => {
            await deletePaymentMethod(id, qrisUrl);
            setAlertState({ isOpen: false, title: "", message: "", type: "info" }); // Tutup warning
            fetchData();
        }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Metode Pembayaran</h1>
          <p className="text-slate-500">Atur rekening bank dan QRIS untuk pembayaran warga.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18} />}>
          Tambah Metode
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {isLoading ? (
             <p className="text-slate-500 col-span-2 text-center py-10">Memuat data...</p>
         ) : methods.length > 0 ? (
             methods.map((item) => (
                 <div key={item.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                     <div className="flex items-start justify-between mb-4">
                         <div className="flex items-center gap-3">
                             <div className={`p-3 rounded-lg ${item.type === 'qris' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                 {item.type === 'qris' ? <QrCode size={24}/> : <CreditCard size={24}/>}
                             </div>
                             <div>
                                 <h3 className="font-bold text-slate-800">{item.name}</h3>
                                 <p className="text-xs text-slate-500 uppercase">{item.type}</p>
                             </div>
                         </div>
                         <button 
                            onClick={() => handleDelete(item.id, item.qrisImageUrl)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                         >
                             <Trash2 size={20} />
                         </button>
                     </div>

                     {item.type === 'bank' ? (
                         <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-1">
                             <p className="text-xs text-slate-500">Nomor Rekening</p>
                             <p className="text-lg font-mono font-bold text-slate-800 tracking-wider">{item.accountNumber}</p>
                             <p className="text-xs text-slate-500 mt-2">Atas Nama</p>
                             <p className="text-sm font-medium text-slate-700">{item.accountHolder}</p>
                         </div>
                     ) : (
                         <div className="relative w-full h-48 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                             {item.qrisImageUrl && (
                                <Image 
                                    src={item.qrisImageUrl} 
                                    alt="QRIS" 
                                    fill 
                                    className="object-contain p-2"
                                />
                             )}
                         </div>
                     )}
                 </div>
             ))
         ) : (
             <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                 <p className="text-slate-500">Belum ada metode pembayaran yang diatur.</p>
             </div>
         )}
      </div>

      <PaymentMethodForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />
      
      <AlertModal 
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={alertState.onConfirm}
      />
    </div>
  );
}